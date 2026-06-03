from __future__ import annotations

import json
import math
import re
from typing import Any, Dict, List, Optional, Sequence, Tuple

from .config import settings
from .llm_client import LLMClient
from .models import DimensionConfig, Evidence, ExtractedItem, ExtractionRun, ExtractionTemplate, Paper, ReviewStatus
from .section_policy import (
    default_section_policy_for_dimension,
    normalize_section_policy,
    section_label,
    section_type_names,
    classify_section_title,
)

STOPWORDS = set("the a an of in on to for and or with by from is are was were be this that these those it as into about we our their its using use used can may not".split())
EXTRACTION_MAX_OUTPUT_TOKENS = 1024
MAX_SYSTEM_PROMPT_CHARS = 1000
MAX_CONTEXT_CHARS = 3000
MAX_CHUNK_CONTEXT_CHARS = 750
MAX_RANKED_CHUNKS = 12
GROUP_QUOTA_RATIO = {
    "prefer": 0.65,
    "allow": 0.25,
    "demote": 0.10,
}
DIMENSION_CONTEXT_BUDGETS = {
    "definition": {"max_context_chars": 2600, "max_chunks": 5, "per_chunk_chars": 650},
    "source": {"max_context_chars": 3200, "max_chunks": 6, "per_chunk_chars": 750},
    "method": {"max_context_chars": 3600, "max_chunks": 7, "per_chunk_chars": 800},
    "representation": {"max_context_chars": 3200, "max_chunks": 6, "per_chunk_chars": 750},
    "usage": {"max_context_chars": 3600, "max_chunks": 7, "per_chunk_chars": 800},
    "update": {"max_context_chars": 3200, "max_chunks": 6, "per_chunk_chars": 750},
    "experiment": {"max_context_chars": 3600, "max_chunks": 7, "per_chunk_chars": 800},
    "limitation": {"max_context_chars": 2800, "max_chunks": 5, "per_chunk_chars": 700},
}


def tokenize(text: str) -> List[str]:
    return [t.lower() for t in re.findall(r"[A-Za-z0-9_\-]+|[\u4e00-\u9fff]+", text) if t.lower() not in STOPWORDS]


def score_chunk(query_terms: List[str], text: str) -> float:
    text_l = text.lower()
    score = 0.0
    for term in query_terms:
        if not term:
            continue
        count = text_l.count(term.lower())
        if count:
            score += 1.0 + math.log(count + 1)
    return score


def classify_section_type(value: str | None) -> str:
    return classify_section_title(value)


def resolve_section_policy(dimension: Optional[DimensionConfig]) -> Dict[str, Any]:
    if dimension is None:
        policy = normalize_section_policy(None)
        policy.update({"max_context_chars": MAX_CONTEXT_CHARS, "max_chunks": settings.extraction_top_k_chunks, "per_chunk_chars": MAX_CHUNK_CONTEXT_CHARS})
        return policy
    base = default_section_policy_for_dimension(dimension.name, dimension.label, dimension.description)
    merged = {**base, **(dimension.section_policy or {})}
    policy = normalize_section_policy(merged)
    budget = dimension_context_budget(dimension)
    policy.update({**budget, **{key: merged[key] for key in ("max_context_chars", "max_chunks", "per_chunk_chars") if key in merged and merged[key]}})
    return policy


def dimension_context_budget(dimension: DimensionConfig) -> Dict[str, int]:
    text = " ".join([dimension.name or "", dimension.label or "", dimension.description or ""]).lower()
    checks = [
        ("definition", r"definition|定义|identity|元信息"),
        ("source", r"source|来源|collection|data"),
        ("method", r"method|extraction|extract|抽取|方法|步骤|algorithm|流程|pipeline"),
        ("representation", r"representation|表示|storage|存储"),
        ("usage", r"usage|use|使用|planning|decision|应用"),
        ("update", r"update|更新|adapt|refine|迭代|transfer"),
        ("experiment", r"experiment|evaluation|evidence|effect|result|效果|实验|验证"),
        ("limitation", r"limitation|局限|risk|failure|future"),
    ]
    for key, pattern in checks:
        if re.search(pattern, text, re.I):
            return DIMENSION_CONTEXT_BUDGETS[key]
    return {"max_context_chars": MAX_CONTEXT_CHARS, "max_chunks": settings.extraction_top_k_chunks, "per_chunk_chars": MAX_CHUNK_CONTEXT_CHARS}


def section_weight(section_type: str, policy: Dict[str, Any]) -> float:
    if section_type in policy["prefer"]:
        return 6.0
    if section_type in policy["allow"]:
        return 2.0
    if section_type in {"conclusion", "appendix"}:
        return -1.0
    if section_type == "related_work":
        return -5.0
    return 0.0


def section_priority(section_type: str, policy: Dict[str, Any]) -> int:
    if section_type in policy["prefer"]:
        return 3
    if section_type in policy["allow"]:
        return 2
    if section_type in {"conclusion", "appendix", "related_work"}:
        return 0
    return 1


def extra_chunk_score(text: str, dimension: DimensionConfig, section_type: str) -> float:
    text_l = text.lower()
    score = 0.0
    object_terms = ["experience", "memory", "reflection", "lesson", "feedback", "trajectory", "strategy", "policy", "经验", "记忆", "反思", "反馈", "轨迹", "策略"]
    field_terms = tokenize(" ".join(dimension.fields or []))
    score += min(4.0, sum(0.35 for term in object_terms if term in text_l))
    score += min(3.0, sum(0.4 for term in field_terms if term and term in text_l))
    score -= citation_density_penalty(text)
    if section_type == "related_work":
        score -= 3.0
    return score


def citation_density_penalty(text: str) -> float:
    if not text:
        return 0.0
    citation_count = len(re.findall(r"\[[0-9,;\-\s]+\]|\([A-Z][A-Za-z]+(?: et al\.)?,?\s+(?:19|20)\d{2}\)", text))
    density = citation_count / max(1, len(text) / 1000)
    return min(4.0, density * 0.8)


def select_ranked_chunks(scored: List[Tuple[float, Any, str]], policy: Dict[str, Any], top_k: int) -> List[Any]:
    max_chunks = int(policy.get("max_chunks") or top_k or settings.extraction_top_k_chunks)
    candidate_limit = max(MAX_RANKED_CHUNKS, max_chunks * 2)
    prefer_limit = max(2, math.ceil(max_chunks * GROUP_QUOTA_RATIO["prefer"]))
    allow_limit = max(1, math.floor(max_chunks * GROUP_QUOTA_RATIO["allow"]))
    demote_limit = max(1, math.ceil(max_chunks * GROUP_QUOTA_RATIO["demote"]))
    selected: List[Any] = []
    counters = {"prefer": 0, "allow": 0, "demote": 0, "other": 0}
    seen = set()
    for _, chunk, section_type in scored[:candidate_limit]:
        if chunk.id in seen:
            continue
        group = chunk_group(section_type, policy)
        if not quota_ok(group, counters, prefer_limit, allow_limit, demote_limit):
            continue
        selected.append(chunk)
        seen.add(chunk.id)
        counters[group] = counters.get(group, 0) + 1
        if len(selected) >= max_chunks:
            break
    if selected:
        return selected
    return [chunk for _, chunk, _ in scored[:max_chunks]]


def chunk_group(section_type: str, policy: Dict[str, Any]) -> str:
    if section_type in policy["prefer"]:
        return "prefer"
    if section_type in policy["allow"]:
        return "allow"
    if section_type in {"conclusion", "appendix", "related_work"}:
        return "demote"
    return "other"


def quota_ok(group: str, counters: Dict[str, int], prefer_limit: int, allow_limit: int, demote_limit: int) -> bool:
    if group == "prefer":
        return counters.get(group, 0) < prefer_limit
    if group == "allow":
        return counters.get(group, 0) < allow_limit
    if group == "demote":
        return counters.get(group, 0) < demote_limit
    return counters.get(group, 0) < 1


def retrieve_chunks(paper: Paper, dimension: DimensionConfig, top_k: Optional[int] = None) -> List[Any]:
    policy = resolve_section_policy(dimension)
    query_text = " ".join(
        [dimension.name, dimension.label, dimension.description]
        + list(dimension.retrieval_keywords or [])
        + list(dimension.fields or [])
    )
    terms = tokenize(query_text)
    scored: List[Tuple[float, Any, str]] = []
    for chunk in paper.chunks:
        section_type = classify_section_type(getattr(chunk, "section_type", None) or getattr(chunk, "section_title", None))
        if section_type in set(policy["exclude"]):
            continue
        text = chunk.text or ""
        base_score = score_chunk(terms, text)
        section_score = section_weight(section_type, policy)
        content_score = extra_chunk_score(text, dimension, section_type)
        score = base_score + section_score + content_score
        if score <= 0 and section_type not in policy["prefer"]:
            continue
        scored.append((score, chunk, section_type))
    if not scored:
        for chunk in paper.chunks:
            section_type = classify_section_type(getattr(chunk, "section_type", None) or getattr(chunk, "section_title", None))
            if section_type in set(policy["exclude"]):
                continue
            text = chunk.text or ""
            score = score_chunk(terms, text) + section_weight(section_type, policy)
            scored.append((score, chunk, section_type))
    scored.sort(key=lambda item: (item[0], section_priority(item[2], policy)), reverse=True)
    return select_ranked_chunks(scored, policy, top_k or settings.extraction_top_k_chunks)


class ExperienceExtractor:
    def __init__(self, llm_client: Optional[LLMClient] = None):
        self.llm = llm_client or LLMClient()

    async def run(self, paper: Paper, template: ExtractionTemplate, selected_dimensions: Optional[List[str]] = None) -> ExtractionRun:
        dimensions = template.dimensions
        if selected_dimensions:
            selected = set(selected_dimensions)
            dimensions = [d for d in dimensions if d.name in selected]
        run = ExtractionRun(paper_id=paper.id, template_id=template.id, status="running", model=self.llm.model)
        for dimension in dimensions:
            try:
                item_results = await self.extract_dimension(paper, template, dimension)
                run.items.extend(item_results)
            except Exception as exc:
                run.errors.append(f"{dimension.name}: {exc}")
        run.status = "completed_with_errors" if run.errors else "completed"
        return run

    async def extract_dimension(self, paper: Paper, template: ExtractionTemplate, dimension: DimensionConfig) -> List[ExtractedItem]:
        chunks = retrieve_chunks(paper, dimension)
        context = build_context(chunks, dimension)
        messages = [
            {
                "role": "system",
                "content": build_compact_system_prompt(template),
            },
            {
                "role": "user",
                "content": build_dimension_prompt(paper, dimension, context),
            },
        ]
        data = await self.llm.extract_json(messages, max_tokens=EXTRACTION_MAX_OUTPUT_TOKENS)
        raw_items = data.get("items", [])
        if not raw_items and data.get("not_found"):
            return [
                ExtractedItem(
                    dimension_name=dimension.name,
                    dimension_label=dimension.label,
                    title="未发现",
                    content="论文中没有找到该维度的明确证据。",
                    evidence=[],
                    confidence=0.0,
                    model_notes=data.get("notes"),
                )
            ]
        items: List[ExtractedItem] = []
        for raw in raw_items:
            evidence = build_evidence(paper.id, chunks, raw)
            item = ExtractedItem(
                dimension_name=dimension.name,
                dimension_label=dimension.label,
                title=str(raw.get("title") or raw.get("name") or dimension.label)[:300],
                content=stringify_content(raw.get("content") or raw.get("value") or raw.get("summary") or raw),
                normalized_value=raw.get("normalized_value"),
                evidence=evidence,
                confidence=float(raw.get("confidence") or 0.5),
                model_notes=raw.get("notes") or raw.get("model_notes"),
            )
            items.append(item)
        return items


def build_context(chunks: List[Any], dimension: Optional[DimensionConfig] = None) -> str:
    policy = resolve_section_policy(dimension)
    max_context_chars = int(policy.get("max_context_chars") or MAX_CONTEXT_CHARS)
    per_chunk_chars = int(policy.get("per_chunk_chars") or MAX_CHUNK_CONTEXT_CHARS)
    prefer_limit = int(policy.get("prefer_limit") or max(2, math.ceil((policy.get("max_chunks") or settings.extraction_top_k_chunks) * GROUP_QUOTA_RATIO["prefer"])))
    allow_limit = int(policy.get("allow_limit") or max(1, math.floor((policy.get("max_chunks") or settings.extraction_top_k_chunks) * GROUP_QUOTA_RATIO["allow"])))
    demote_limit = int(policy.get("demote_limit") or max(1, math.ceil((policy.get("max_chunks") or settings.extraction_top_k_chunks) * GROUP_QUOTA_RATIO["demote"])))
    counters = {"prefer": 0, "allow": 0, "demote": 0, "other": 0}
    blocks = []
    total_chars = 0
    header = (
        f"[CONTEXT_POLICY] prefer={section_type_names(policy['prefer'])}; "
        f"allow={section_type_names(policy['allow'])}; "
        f"exclude={section_type_names(policy['exclude'])}; "
        f"max_context_chars={max_context_chars}; per_chunk_chars={per_chunk_chars}"
    )
    blocks.append(header)
    total_chars += len(header)
    for idx, chunk in enumerate(chunks, start=1):
        loc = f"section={chunk.section_title or 'Unknown'}, pages={chunk.page_start or '?'}-{chunk.page_end or '?'}"
        text = re.sub(r"\s+", " ", chunk.text).strip()
        remaining = max_context_chars - total_chars
        if remaining <= 0:
            break
        section_type = classify_section_type(getattr(chunk, "section_type", None) or getattr(chunk, "section_title", None))
        group = chunk_group(section_type, policy)
        if not quota_ok(group, counters, prefer_limit, allow_limit, demote_limit):
            continue
        text = text[: min(per_chunk_chars, remaining)]
        total_chars += len(text)
        counters[group] = counters.get(group, 0) + 1
        blocks.append(f"[CHUNK {idx}] chunk_id={chunk.id}; section_type={section_type}; section_label={section_label(section_type)}; {loc}\n{text}")
    return "\n\n".join(blocks)


def build_compact_system_prompt(template: ExtractionTemplate) -> str:
    base = template.system_prompt or DEFAULT_SYSTEM_PROMPT
    if len(base) > MAX_SYSTEM_PROMPT_CHARS:
        base = base[:MAX_SYSTEM_PROMPT_CHARS].rstrip() + "\n...[模板 Prompt 已为适配当前模型上下文而截断，维度细节见用户消息]"
    return f"""
{base}

请特别遵守：
- 只基于用户提供的论文片段抽取。
- 只处理用户消息中指定的当前维度，不要展开其他维度。
- 输出必须是合法 JSON，顶层字段为 not_found、items、notes。
- 每个 item 尽量包含 title、content、normalized_value、evidence_quotes、chunk_ids、confidence、notes。
- 输出要紧凑：items 最多 3 条，content 不超过 300 个中文字符或 180 个英文词，evidence_quotes 最多 2 条且每条不超过 220 字符。
""".strip()


def build_dimension_prompt(paper: Paper, dimension: DimensionConfig, context: str) -> str:
    metadata = paper.metadata.model_dump(mode="json")
    schema_hint = {
        "not_found": False,
        "items": [
            {
                "title": "短标题",
                "content": "抽取内容，必须忠实于论文；保持简洁，不要长篇复述",
                "normalized_value": {},
                "evidence_quotes": ["从上下文中复制的原文短句或短段"],
                "chunk_ids": ["chunk_xxx"],
                "confidence": 0.0,
                "notes": "不确定性、限定条件、是否为作者claim或实验结论",
            }
        ],
        "notes": "整体说明",
    }
    return f"""
你正在为科研人员做文献精读级信息抽取。请只基于给定论文片段抽取，不要使用外部知识，不要编造。

论文元数据：
{json.dumps(compact_metadata(metadata), ensure_ascii=False, indent=2)}

当前抽取维度：
- name: {dimension.name}
- label: {dimension.label}
- description: {dimension.description}
- required_evidence: {dimension.required_evidence}
- allow_not_found: {dimension.allow_not_found}
- expected_fields: {dimension.fields}

论文相关片段：
{context}

输出要求：
1. 必须返回合法 JSON，不要 markdown。
2. 每条结果都要尽量提供 evidence_quotes 和 chunk_ids。
3. 区分作者声称、实验支持、模型推断；不能把推断当事实。
4. 如果上下文没有明确证据，请返回 {json.dumps({'not_found': True, 'items': [], 'notes': '未发现明确证据'}, ensure_ascii=False)}。
5. 只抽取当前维度，不要输出其他维度。
6. 输出要紧凑：items 最多 3 条，content 不超过 300 个中文字符或 180 个英文词；evidence_quotes 最多 2 条，每条不超过 220 字符。
7. normalized_value 只保留关键字段，不要输出长表格、长列表或完整实验矩阵。
8. 建议 JSON 结构如下：
{json.dumps(schema_hint, ensure_ascii=False, indent=2)}
""".strip()


def compact_metadata(metadata: Dict[str, Any]) -> Dict[str, Any]:
    allowed = ["title", "authors", "year", "venue", "abstract", "doi", "arxiv_id", "url", "keywords"]
    compact = {key: metadata.get(key) for key in allowed if metadata.get(key)}
    if isinstance(compact.get("abstract"), str) and len(compact["abstract"]) > 1200:
        compact["abstract"] = compact["abstract"][:1200] + "..."
    return compact


def stringify_content(value: Any) -> str:
    if isinstance(value, str):
        return value
    return json.dumps(value, ensure_ascii=False, indent=2)


def build_evidence(paper_id: str, chunks: List[Any], raw: Dict[str, Any]) -> List[Evidence]:
    evidence_items: List[Evidence] = []
    id_to_chunk = {c.id: c for c in chunks}
    quotes = raw.get("evidence_quotes") or raw.get("quotes") or []
    chunk_ids = raw.get("chunk_ids") or []
    if isinstance(quotes, str):
        quotes = [quotes]
    if isinstance(chunk_ids, str):
        chunk_ids = [chunk_ids]

    used_chunks = []
    for cid in chunk_ids:
        if cid in id_to_chunk:
            used_chunks.append(id_to_chunk[cid])
    if not used_chunks and chunks:
        # Find the chunks that contain evidence quotes.
        for quote in quotes[:3]:
            quote_norm = re.sub(r"\s+", " ", str(quote)).strip().lower()[:120]
            for chunk in chunks:
                if quote_norm and quote_norm in re.sub(r"\s+", " ", chunk.text).lower():
                    used_chunks.append(chunk)
                    break
    if not used_chunks and chunks:
        used_chunks = chunks[:1]

    for idx, chunk in enumerate(used_chunks[:5]):
        quote = str(quotes[idx]) if idx < len(quotes) else chunk.text[:500]
        evidence_items.append(
            Evidence(
                paper_id=paper_id,
                chunk_id=chunk.id,
                section_title=chunk.section_title,
                page_start=chunk.page_start,
                page_end=chunk.page_end,
                quote=quote[:1200],
                relevance=raw.get("evidence_relevance") or raw.get("notes"),
            )
        )
    return evidence_items


DEFAULT_SYSTEM_PROMPT = """
你是一个严谨的科研文献精读助手。你的任务是从论文中抽取结构化研究素材，而不是写流畅摘要。
你必须遵守：
- 只根据提供的论文片段回答。
- 每个重要结论都需要绑定原文证据。
- 明确区分作者 claim、实验结果、系统推断、局限条件。
- 没有证据时返回未发现，不要补全。
- 输出必须是合法 JSON。
""".strip()
