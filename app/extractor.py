from __future__ import annotations

import json
import math
import re
from typing import Any, Dict, List, Optional

from .config import settings
from .llm_client import LLMClient
from .models import DimensionConfig, Evidence, ExtractedItem, ExtractionRun, ExtractionTemplate, Paper, ReviewStatus

STOPWORDS = set("the a an of in on to for and or with by from is are was were be this that these those it as into about we our their its using use used can may not".split())
EXTRACTION_MAX_OUTPUT_TOKENS = 1024
MAX_SYSTEM_PROMPT_CHARS = 1000
MAX_CONTEXT_CHARS = 3000
MAX_CHUNK_CONTEXT_CHARS = 750


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


def retrieve_chunks(paper: Paper, dimension: DimensionConfig, top_k: Optional[int] = None) -> List[Any]:
    top_k = top_k or settings.extraction_top_k_chunks
    query_text = " ".join([dimension.name, dimension.label, dimension.description] + dimension.retrieval_keywords)
    terms = tokenize(query_text)
    scored = []
    for chunk in paper.chunks:
        scored.append((score_chunk(terms, chunk.text), chunk))
    scored.sort(key=lambda x: x[0], reverse=True)
    positive = [chunk for score, chunk in scored if score > 0]
    return (positive or [chunk for _, chunk in scored])[:top_k]


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
        context = build_context(chunks)
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


def build_context(chunks: List[Any]) -> str:
    blocks = []
    total_chars = 0
    for idx, chunk in enumerate(chunks, start=1):
        loc = f"section={chunk.section_title or 'Unknown'}, pages={chunk.page_start or '?'}-{chunk.page_end or '?'}"
        text = re.sub(r"\s+", " ", chunk.text).strip()
        remaining = MAX_CONTEXT_CHARS - total_chars
        if remaining <= 0:
            break
        text = text[: min(MAX_CHUNK_CONTEXT_CHARS, remaining)]
        total_chars += len(text)
        blocks.append(f"[CHUNK {idx}] chunk_id={chunk.id}; {loc}\n{text}")
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
