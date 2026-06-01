from __future__ import annotations

from collections import Counter, defaultdict
from difflib import SequenceMatcher
from typing import Any, Dict, Iterable, List, Optional

from .models import ExtractionTemplate, ReviewRecord, ReviewStatus


CONFIRM_ACTIONS = {ReviewStatus.confirm, ReviewStatus.confirmed}
REVISE_ACTIONS = {ReviewStatus.revise, ReviewStatus.needs_revision}
REJECT_ACTIONS = {ReviewStatus.reject, ReviewStatus.rejected}
EVIDENCE_ACTIONS = {ReviewStatus.mark_evidence_insufficient}
OVER_INFERENCE_ACTIONS = {ReviewStatus.mark_over_inferred}
NOT_REPORTED_ACTIONS = {ReviewStatus.mark_not_reported}
WRONG_DIMENSION_ACTIONS = {ReviewStatus.mark_wrong_dimension}

EVIDENCE_TAGS = {"evidence_missing", "evidence_not_support_answer", "wrong_section_evidence"}
OVER_INFERENCE_TAGS = {"over_inference"}
NOT_REPORTED_TAGS = {"not_reported_should_be_used"}
WRONG_DIMENSION_TAGS = {"wrong_dimension"}


def review_label_for_action(action: ReviewStatus) -> str:
    if action in CONFIRM_ACTIONS:
        return "correct"
    if action in REVISE_ACTIONS:
        return "partially_correct"
    if action in REJECT_ACTIONS:
        return "incorrect"
    return {
        ReviewStatus.mark_not_reported: "not_reported_should_be_used",
        ReviewStatus.mark_evidence_insufficient: "evidence_insufficient",
        ReviewStatus.mark_over_inferred: "over_inferred",
        ReviewStatus.mark_wrong_dimension: "wrong_dimension",
        ReviewStatus.mark_wrong_object: "wrong_object",
    }.get(action, "needs_review")


def edit_distance(old: str, new: str) -> int:
    old = old or ""
    new = new or ""
    if old == new:
        return 0
    matcher = SequenceMatcher(None, old, new)
    same = sum(block.size for block in matcher.get_matching_blocks())
    return max(len(old), len(new)) - same


def rate(count: int, total: int) -> float:
    return round(count / total, 4) if total else 0.0


def build_feedback_summary(
    records: Iterable[ReviewRecord],
    templates: Iterable[ExtractionTemplate],
    profile_id: Optional[str] = None,
    dimension_id: Optional[str] = None,
) -> Dict[str, Any]:
    filtered = [
        r for r in records
        if (not profile_id or r.profile_id == profile_id)
        and (not dimension_id or r.dimension_id == dimension_id)
    ]
    templates_by_id = {t.id: t for t in templates}
    grouped: Dict[tuple[str, str, str], List[ReviewRecord]] = defaultdict(list)
    for record in filtered:
        grouped[(record.profile_id, record.profile_version, record.dimension_id)].append(record)

    pools = []
    for (pid, version, dim_id), items in sorted(grouped.items(), key=lambda kv: (kv[0][0], kv[0][2])):
        template = templates_by_id.get(pid)
        dim = next((d for d in (template.dimensions if template else []) if d.name == dim_id), None)
        pools.append(build_dimension_pool(pid, version, dim_id, dim.label if dim else items[-1].dimension_name, items))

    upgrade_candidates = []
    for pool in pools:
        upgrade_candidates.extend(pool["feedback_pool"]["upgrade_candidates"])

    return {
        "total_reviews": len(filtered),
        "dimension_count": len(pools),
        "dimension_pools": pools,
        "upgrade_candidates": upgrade_candidates,
    }


def build_dimension_pool(profile_id: str, version: str, dimension_id: str, dimension_name: str, records: List[ReviewRecord]) -> Dict[str, Any]:
    total = len(records)
    action_counts = Counter(r.review_action.value for r in records)
    tag_counts = Counter(tag for r in records for tag in r.error_tags)
    root_cause_counts = Counter(r.root_cause for r in records if r.root_cause)
    target_counts = Counter(r.suggested_target for r in records if r.suggested_target)
    prompt_counts = Counter(r.prompt_id for r in records if r.prompt_id)
    edit_distances = [
        edit_distance(r.reviewer_edit.get("old_answer", ""), r.reviewer_edit.get("new_answer", ""))
        for r in records
        if r.reviewer_edit.get("old_answer") != r.reviewer_edit.get("new_answer")
    ]
    confirmed = sum(action_counts[a.value] for a in CONFIRM_ACTIONS)
    revised = sum(action_counts[a.value] for a in REVISE_ACTIONS)
    rejected = sum(action_counts[a.value] for a in REJECT_ACTIONS)
    evidence_issues = count_action_or_tag(records, EVIDENCE_ACTIONS, EVIDENCE_TAGS)
    over_inference = count_action_or_tag(records, OVER_INFERENCE_ACTIONS, OVER_INFERENCE_TAGS)
    not_reported = count_action_or_tag(records, NOT_REPORTED_ACTIONS, NOT_REPORTED_TAGS)
    wrong_dimension = count_action_or_tag(records, WRONG_DIMENSION_ACTIONS, WRONG_DIMENSION_TAGS)
    metrics = {
        "confirm_rate": rate(confirmed, total),
        "revise_rate": rate(revised, total),
        "reject_rate": rate(rejected, total),
        "evidence_issue_rate": rate(evidence_issues, total),
        "over_inference_rate": rate(over_inference, total),
        "not_reported_correction_rate": rate(not_reported, total),
        "wrong_dimension_rate": rate(wrong_dimension, total),
        "average_edit_distance": round(sum(edit_distances) / len(edit_distances), 2) if edit_distances else 0.0,
    }
    representative_cases = [
        {
            "review_id": r.id,
            "paper_id": r.paper_id,
            "result_id": r.result_id,
            "review_action": r.review_action.value,
            "review_comment": r.review_comment,
            "error_tags": r.error_tags,
            "root_cause": r.root_cause,
            "suggested_target": r.suggested_target,
        }
        for r in sorted(records, key=lambda item: item.created_at, reverse=True)
        if r.review_action not in CONFIRM_ACTIONS or r.error_tags or r.review_comment
    ][:5]
    common_edits = [
        {
            "review_id": r.id,
            "old_answer": r.reviewer_edit.get("old_answer", ""),
            "new_answer": r.reviewer_edit.get("new_answer", ""),
            "comment": r.review_comment,
        }
        for r in sorted(records, key=lambda item: item.created_at, reverse=True)
        if r.reviewer_edit.get("old_answer") != r.reviewer_edit.get("new_answer")
    ][:5]
    pool = {
        "total_reviews": total,
        "confirmed": confirmed,
        "revised": revised,
        "rejected": rejected,
        "action_counts": dict(action_counts),
        "common_error_tags": dict(tag_counts.most_common(12)),
        "common_root_causes": dict(root_cause_counts.most_common(8)),
        "common_suggested_targets": dict(target_counts.most_common(8)),
        "prompt_counts": dict(prompt_counts.most_common(8)),
        "common_user_edits": common_edits,
        "representative_cases": representative_cases,
        "metrics": metrics,
        "upgrade_candidates": [],
    }
    pool["upgrade_candidates"] = generate_upgrade_candidates(profile_id, version, dimension_id, dimension_name, pool)
    return {
        "profile_id": profile_id,
        "profile_version": version,
        "dimension_id": dimension_id,
        "dimension_name": dimension_name,
        "feedback_pool": pool,
    }


def count_action_or_tag(records: List[ReviewRecord], actions: set[ReviewStatus], tags: set[str]) -> int:
    return sum(1 for record in records if record.review_action in actions or tags.intersection(record.error_tags))


def generate_upgrade_candidates(
    profile_id: str,
    profile_version: str,
    dimension_id: str,
    dimension_name: str,
    pool: Dict[str, Any],
) -> List[Dict[str, Any]]:
    metrics = pool["metrics"]
    tags = pool["common_error_tags"]
    root_causes = pool["common_root_causes"]
    candidates: List[Dict[str, Any]] = []

    def add(target_level: str, suggested_target: str, title: str, reason: str, recommended_change: str) -> None:
        candidates.append({
            "profile_id": profile_id,
            "profile_version": profile_version,
            "dimension_id": dimension_id,
            "dimension_name": dimension_name,
            "target_level": target_level,
            "suggested_target": suggested_target,
            "title": title,
            "reason": reason,
            "recommended_change": recommended_change,
            "supporting_review_count": pool["total_reviews"],
        })

    if metrics["revise_rate"] >= 0.25 or tags.get("answer_too_generic", 0) >= 3:
        add(
            "dimension",
            "dimension.question",
            f"收紧“{dimension_name}”的抽取问题",
            "人工修改率较高或答案过泛反复出现。",
            "在维度问题中补充需要回答的机制、作用路径、触发条件和输出形式，避免只给概括性结论。",
        )
    if metrics["evidence_issue_rate"] >= 0.15:
        add(
            "prompt",
            "prompt.evidence_policy",
            f"强化“{dimension_name}”的证据约束",
            "证据不足、证据不支撑答案或证据章节不合适较常见。",
            "在 Prompt 中要求每个非 not_reported 答案绑定直接证据，并优先使用方法、实验、结果或消融章节。",
        )
    if metrics["over_inference_rate"] >= 0.12:
        add(
            "prompt",
            "prompt.inference_policy",
            f"限制“{dimension_name}”的模型推断",
            "过度推断比例偏高。",
            "要求模型仅在论文有明确上下文支撑时推断，并显式标记 model_inferred，否则返回 not_reported。",
        )
    if metrics["not_reported_correction_rate"] >= 0.12:
        add(
            "prompt",
            "prompt.not_reported_policy",
            f"增加“{dimension_name}”的未报告判定规则",
            "用户多次将结果改为未报告。",
            "为该维度列出 not_reported 的触发条件，禁止用背景知识或摘要宽泛 claim 补全。",
        )
    if metrics["wrong_dimension_rate"] >= 0.1 or tags.get("wrong_dimension", 0) >= 2:
        add(
            "dimension",
            "dimension.boundary",
            f"澄清“{dimension_name}”与相邻维度的边界",
            "维度归类错误反复出现。",
            "补充正反例，说明哪些内容属于本维度，哪些应归入来源、表示、使用或效果验证等其他维度。",
        )
    if root_causes.get("object_boundary_unclear", 0) >= 2 or tags.get("wrong_object_boundary", 0) >= 2:
        add(
            "object_definition",
            "object_definition.exclusion_criteria",
            "补充研究对象排除标准",
            "多条反馈被归因为对象边界不清。",
            "在对象定义中新增排除规则，明确普通 memory、单纯实验结果、related work 方法等不应直接视为当前研究对象。",
        )
    return candidates
