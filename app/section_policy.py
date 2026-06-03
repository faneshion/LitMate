from __future__ import annotations

import re
from typing import Any, Dict, Iterable, List, Sequence


SECTION_TYPE_OPTIONS: List[Dict[str, str]] = [
    {"value": "abstract", "label": "摘要"},
    {"value": "introduction", "label": "引言/研究背景"},
    {"value": "related_work", "label": "相关工作"},
    {"value": "method", "label": "方法/框架"},
    {"value": "system", "label": "系统/实现"},
    {"value": "algorithm", "label": "算法/流程"},
    {"value": "experiment", "label": "实验设置"},
    {"value": "results", "label": "实验结果"},
    {"value": "ablation", "label": "消融/分析"},
    {"value": "discussion", "label": "讨论"},
    {"value": "limitations", "label": "局限性"},
    {"value": "conclusion", "label": "结论/未来工作"},
    {"value": "appendix", "label": "附录"},
    {"value": "references", "label": "参考文献"},
    {"value": "other", "label": "其他"},
]

SECTION_LABEL_BY_TYPE = {item["value"]: item["label"] for item in SECTION_TYPE_OPTIONS}
ALL_SECTION_TYPES = [item["value"] for item in SECTION_TYPE_OPTIONS]
HARD_EXCLUDED_SECTION_TYPES = {"references"}

DEFAULT_SECTION_POLICY: Dict[str, List[str]] = {
    "prefer": ["method", "system", "algorithm", "experiment", "results"],
    "allow": ["abstract", "introduction", "discussion", "limitations", "conclusion", "appendix", "other"],
    "exclude": ["references", "related_work"],
}

DIMENSION_SECTION_POLICY_HINTS: List[Dict[str, Any]] = [
    {
        "patterns": [r"definition", r"定义", r"identity", r"元信息"],
        "prefer": ["abstract", "introduction", "method", "system"],
        "allow": ["discussion", "conclusion", "other"],
        "exclude": ["references", "related_work"],
    },
    {
        "patterns": [r"source", r"来源", r"collection", r"data"],
        "prefer": ["method", "system", "algorithm"],
        "allow": ["introduction", "experiment", "appendix", "other"],
        "exclude": ["references", "related_work"],
    },
    {
        "patterns": [r"extraction", r"extract", r"抽取", r"summar", r"learn", r"学习", r"构建"],
        "prefer": ["method", "algorithm", "system"],
        "allow": ["experiment", "appendix", "other"],
        "exclude": ["references", "related_work"],
    },
    {
        "patterns": [r"representation", r"表示", r"storage", r"存储", r"memory"],
        "prefer": ["method", "system", "algorithm"],
        "allow": ["implementation", "appendix", "other"],
        "exclude": ["references", "related_work"],
    },
    {
        "patterns": [r"usage", r"use", r"使用", r"planning", r"decision", r"应用"],
        "prefer": ["method", "system", "algorithm", "experiment"],
        "allow": ["discussion", "appendix", "other"],
        "exclude": ["references", "related_work"],
    },
    {
        "patterns": [r"update", r"更新", r"adapt", r"refine", r"迭代", r"transfer"],
        "prefer": ["method", "algorithm", "system"],
        "allow": ["experiment", "discussion", "appendix", "other"],
        "exclude": ["references", "related_work"],
    },
    {
        "patterns": [r"experiment", r"evaluation", r"evidence", r"effect", r"result", r"效果", r"实验", r"验证"],
        "prefer": ["experiment", "results", "ablation"],
        "allow": ["method", "discussion", "conclusion", "other"],
        "exclude": ["references", "related_work"],
    },
    {
        "patterns": [r"limitation", r"局限", r"risk", r"failure", r"future"],
        "prefer": ["limitations", "discussion", "conclusion"],
        "allow": ["experiment", "results", "other"],
        "exclude": ["references", "related_work"],
    },
    {
        "patterns": [r"motivation", r"background", r"gap", r"动机", r"背景"],
        "prefer": ["abstract", "introduction"],
        "allow": ["discussion", "related_work", "other"],
        "exclude": ["references"],
    },
    {
        "patterns": [r"contribution", r"claim", r"innovation", r"贡献", r"创新", r"观点"],
        "prefer": ["abstract", "introduction", "method"],
        "allow": ["results", "discussion", "conclusion", "other"],
        "exclude": ["references", "related_work"],
    },
    {
        "patterns": [r"reusable", r"material", r"素材", r"综述", r"citation"],
        "prefer": ["method", "experiment", "results", "discussion"],
        "allow": ["abstract", "introduction", "related_work", "conclusion", "other"],
        "exclude": ["references"],
    },
]


def section_label(section_type: str) -> str:
    return SECTION_LABEL_BY_TYPE.get(section_type or "other", SECTION_LABEL_BY_TYPE["other"])


def classify_section_title(title: str | None) -> str:
    text = re.sub(r"\s+", " ", (title or "")).strip().lower()
    if not text:
        return "other"
    text = re.sub(r"^\d+(?:\.\d+)*\s+", "", text)
    text = text.strip(" .:-_")
    if re.search(r"\b(references|bibliography|works cited|参考文献)\b", text):
        return "references"
    if re.search(r"\b(related work|prior work|literature review|background and related|相关工作|相关研究)\b", text):
        return "related_work"
    if re.search(r"\b(abstract|摘要)\b", text):
        return "abstract"
    if re.search(r"\b(introduction|intro|motivation|background|引言|介绍|背景|动机)\b", text):
        return "introduction"
    if re.search(r"\b(method|methodology|approach|framework|architecture|model|proposed|方法|框架|模型|架构)\b", text):
        return "method"
    if re.search(r"\b(system|implementation|prototype|系统|实现)\b", text):
        return "system"
    if re.search(r"\b(algorithm|pipeline|procedure|workflow|流程|算法|步骤)\b", text):
        return "algorithm"
    if re.search(r"\b(experiment|experimental setup|setup|evaluation|benchmark|实验设置|实验|评估|评价)\b", text):
        return "experiment"
    if re.search(r"\b(results?|findings?|performance|效果|结果|性能)\b", text):
        return "results"
    if re.search(r"\b(ablation|analysis|case study|消融|分析|案例)\b", text):
        return "ablation"
    if re.search(r"\b(discussion|讨论)\b", text):
        return "discussion"
    if re.search(r"\b(limitations?|threats to validity|局限|限制|适用边界)\b", text):
        return "limitations"
    if re.search(r"\b(conclusion|future work|结论|未来工作)\b", text):
        return "conclusion"
    if re.search(r"\b(appendix|supplementary|附录|补充材料)\b", text):
        return "appendix"
    return "other"


def normalize_section_policy(policy: Dict[str, Any] | None) -> Dict[str, List[str]]:
    raw = policy if isinstance(policy, dict) else {}
    normalized: Dict[str, List[str]] = {}
    for key in ("prefer", "allow", "exclude"):
        values = raw.get(key, DEFAULT_SECTION_POLICY[key])
        if isinstance(values, str):
            values = [values]
        normalized[key] = [v for v in values if v in ALL_SECTION_TYPES]

    exclude = set(normalized["exclude"]) | HARD_EXCLUDED_SECTION_TYPES
    prefer = [v for v in normalized["prefer"] if v not in exclude]
    allow = [v for v in normalized["allow"] if v not in exclude and v not in prefer]
    normalized["prefer"] = prefer
    normalized["allow"] = allow
    normalized["exclude"] = sorted(exclude, key=ALL_SECTION_TYPES.index)
    return normalized


def default_section_policy_for_dimension(*parts: str) -> Dict[str, List[str]]:
    text = " ".join(part for part in parts if part).lower()
    for hint in DIMENSION_SECTION_POLICY_HINTS:
        if any(re.search(pattern, text, re.I) for pattern in hint["patterns"]):
            return normalize_section_policy(
                {
                    "prefer": hint["prefer"],
                    "allow": hint["allow"],
                    "exclude": hint["exclude"],
                }
            )
    return normalize_section_policy(DEFAULT_SECTION_POLICY)


def section_type_names(values: Sequence[str] | Iterable[str]) -> str:
    return "、".join(section_label(value) for value in values if value in SECTION_LABEL_BY_TYPE) or "无"
