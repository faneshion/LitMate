from __future__ import annotations

import re
from collections import defaultdict
from typing import Any, Dict, Iterable, List, Optional

from .models import CompareReport, ExtractionRun, ExtractionTemplate, MaterialItem, Paper, ReviewStatus


ACCEPTED_REVIEW_STATUSES = {ReviewStatus.confirm, ReviewStatus.revise, ReviewStatus.confirmed}
ERROR_REVIEW_STATUSES = {
    ReviewStatus.reject,
    ReviewStatus.mark_not_reported,
    ReviewStatus.mark_evidence_insufficient,
    ReviewStatus.mark_over_inferred,
    ReviewStatus.mark_wrong_dimension,
    ReviewStatus.mark_wrong_object,
    ReviewStatus.rejected,
}


def text_match_score(query: str, text: str) -> float:
    if not query:
        return 1.0
    terms = [t.lower() for t in re.findall(r"[A-Za-z0-9_\-]+|[\u4e00-\u9fff]+", query)]
    hay = text.lower()
    return sum(hay.count(t) for t in terms)


def search_materials(
    materials: Iterable[MaterialItem],
    query: str = "",
    paper_id: Optional[str] = None,
    dimension_name: Optional[str] = None,
    status: Optional[ReviewStatus] = None,
) -> List[MaterialItem]:
    scored = []
    for item in materials:
        if paper_id and item.paper_id != paper_id:
            continue
        if dimension_name and item.dimension_name != dimension_name:
            continue
        if status and item.review_status != status:
            continue
        text = " ".join([item.title, item.content, item.dimension_label, item.user_note or "", " ".join(item.tags)] + [e.quote for e in item.evidence])
        score = text_match_score(query, text)
        if query and score <= 0:
            continue
        scored.append((score, item))
    scored.sort(key=lambda x: (x[0], x[1].updated_at), reverse=True)
    return [item for _, item in scored]


def build_compare_report(
    papers: List[Paper],
    runs: List[ExtractionRun],
    template: Optional[ExtractionTemplate] = None,
    include_pending: bool = True,
) -> CompareReport:
    paper_ids = [p.id for p in papers]
    paper_map = {p.id: p for p in papers}
    dimensions = [d.name for d in template.dimensions] if template else sorted({item.dimension_name for run in runs for item in run.items})
    rows: List[Dict[str, Any]] = []
    gaps: List[Dict[str, Any]] = []

    run_by_paper = defaultdict(list)
    for run in runs:
        if run.paper_id in paper_ids:
            run_by_paper[run.paper_id].append(run)

    for paper_id in paper_ids:
        paper = paper_map[paper_id]
        row: Dict[str, Any] = {
            "paper_id": paper.id,
            "title": paper.metadata.title,
            "year": paper.metadata.year,
            "authors": ", ".join(paper.metadata.authors[:3]),
        }
        items_by_dim = defaultdict(list)
        for run in run_by_paper.get(paper_id, []):
            for item in run.items:
                if not include_pending and item.review_status not in ACCEPTED_REVIEW_STATUSES:
                    continue
                items_by_dim[item.dimension_name].append(item)
        for dim in dimensions:
            items = items_by_dim.get(dim, [])
            if not items:
                row[dim] = ""
                gaps.append({"paper_id": paper_id, "title": paper.metadata.title, "dimension": dim, "gap": "missing"})
            else:
                row[dim] = "\n---\n".join((i.edited_content or i.content)[:800] for i in items[:3])
        rows.append(row)
    return CompareReport(paper_ids=paper_ids, template_id=template.id if template else None, dimensions=dimensions, matrix=rows, gaps=gaps)


def build_gap_summary(papers: List[Paper], runs: List[ExtractionRun], template: ExtractionTemplate) -> Dict[str, Any]:
    dimensions = [d.name for d in template.dimensions]
    by_paper = defaultdict(lambda: defaultdict(int))
    low_conf = []
    no_evidence = []
    rejected = []
    for run in runs:
        for item in run.items:
            by_paper[run.paper_id][item.dimension_name] += 1
            if item.confidence < 0.45:
                low_conf.append({"paper_id": run.paper_id, "item_id": item.id, "dimension": item.dimension_name, "title": item.title})
            if not item.evidence:
                no_evidence.append({"paper_id": run.paper_id, "item_id": item.id, "dimension": item.dimension_name, "title": item.title})
            if item.review_status in ERROR_REVIEW_STATUSES:
                rejected.append({"paper_id": run.paper_id, "item_id": item.id, "dimension": item.dimension_name, "title": item.title})
    missing = []
    for paper in papers:
        for dim in dimensions:
            if by_paper[paper.id][dim] == 0:
                missing.append({"paper_id": paper.id, "title": paper.metadata.title, "dimension": dim})
    return {
        "paper_count": len(papers),
        "dimension_count": len(dimensions),
        "missing_dimension_items": missing,
        "low_confidence_items": low_conf,
        "items_without_evidence": no_evidence,
        "rejected_items": rejected,
    }


def build_evidence_graph(materials: List[MaterialItem], papers: List[Paper]) -> Dict[str, Any]:
    nodes = []
    links = []
    paper_titles = {p.id: p.metadata.title for p in papers}
    added = set()
    for mat in materials:
        pid = f"paper:{mat.paper_id}"
        did = f"dim:{mat.dimension_name}"
        mid = f"mat:{mat.id}"
        for nid, label, kind in [(pid, paper_titles.get(mat.paper_id, mat.paper_id), "paper"), (did, mat.dimension_label, "dimension"), (mid, mat.title or mat.dimension_label, "material")]:
            if nid not in added:
                nodes.append({"id": nid, "label": label, "type": kind})
                added.add(nid)
        links.append({"source": pid, "target": mid, "type": "has_material"})
        links.append({"source": mid, "target": did, "type": "belongs_to_dimension"})
        for ev in mat.evidence[:3]:
            eid = f"ev:{ev.id}"
            if eid not in added:
                nodes.append({"id": eid, "label": (ev.quote[:80] + "...") if len(ev.quote) > 80 else ev.quote, "type": "evidence"})
                added.add(eid)
            links.append({"source": mid, "target": eid, "type": "supported_by"})
    return {"nodes": nodes, "links": links}
