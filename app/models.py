from __future__ import annotations

from datetime import datetime, timezone
from enum import Enum
from typing import Any, Dict, List, Optional
from uuid import uuid4

from pydantic import BaseModel, Field, HttpUrl


def now_iso() -> str:
    return datetime.now(timezone.utc).isoformat()


def new_id(prefix: str) -> str:
    return f"{prefix}_{uuid4().hex[:12]}"


class ReviewStatus(str, Enum):
    pending = "pending"
    confirm = "confirm"
    revise = "revise"
    reject = "reject"
    mark_not_reported = "mark_not_reported"
    mark_evidence_insufficient = "mark_evidence_insufficient"
    mark_over_inferred = "mark_over_inferred"
    mark_wrong_dimension = "mark_wrong_dimension"
    mark_wrong_object = "mark_wrong_object"
    # Backward-compatible values used by earlier local data.
    confirmed = "confirmed"
    rejected = "rejected"
    needs_revision = "needs_revision"


class ImportSource(str, Enum):
    upload = "upload"
    arxiv = "arxiv"
    doi = "doi"
    bibtex = "bibtex"
    manual = "manual"


class PaperMetadata(BaseModel):
    title: str = "Untitled"
    authors: List[str] = Field(default_factory=list)
    year: Optional[int] = None
    venue: Optional[str] = None
    abstract: Optional[str] = None
    doi: Optional[str] = None
    arxiv_id: Optional[str] = None
    url: Optional[str] = None
    pdf_url: Optional[str] = None
    keywords: List[str] = Field(default_factory=list)
    bibtex: Optional[str] = None
    extra: Dict[str, Any] = Field(default_factory=dict)


class Section(BaseModel):
    id: str = Field(default_factory=lambda: new_id("sec"))
    title: str
    level: int = 1
    start_page: Optional[int] = None
    end_page: Optional[int] = None
    text: str = ""


class FigureInfo(BaseModel):
    id: str = Field(default_factory=lambda: new_id("fig"))
    label: str = ""
    caption: str = ""
    page: Optional[int] = None
    image_path: Optional[str] = None


class ReferenceInfo(BaseModel):
    id: str = Field(default_factory=lambda: new_id("ref"))
    raw: str
    title: Optional[str] = None
    authors: List[str] = Field(default_factory=list)
    year: Optional[int] = None
    doi: Optional[str] = None


class DocumentChunk(BaseModel):
    id: str = Field(default_factory=lambda: new_id("chunk"))
    paper_id: str
    section_title: Optional[str] = None
    page_start: Optional[int] = None
    page_end: Optional[int] = None
    text: str
    token_estimate: int = 0


class Paper(BaseModel):
    id: str = Field(default_factory=lambda: new_id("paper"))
    source: ImportSource = ImportSource.upload
    metadata: PaperMetadata = Field(default_factory=PaperMetadata)
    file_path: Optional[str] = None
    text_path: Optional[str] = None
    full_text: str = ""
    sections: List[Section] = Field(default_factory=list)
    figures: List[FigureInfo] = Field(default_factory=list)
    references: List[ReferenceInfo] = Field(default_factory=list)
    chunks: List[DocumentChunk] = Field(default_factory=list)
    created_at: str = Field(default_factory=now_iso)
    updated_at: str = Field(default_factory=now_iso)


class DimensionConfig(BaseModel):
    name: str
    label: str
    description: str
    output_type: str = "list"
    required_evidence: bool = True
    allow_not_found: bool = True
    fields: List[str] = Field(default_factory=list)
    examples: List[str] = Field(default_factory=list)
    negative_examples: List[str] = Field(default_factory=list)
    retrieval_keywords: List[str] = Field(default_factory=list)


class PromptProfile(BaseModel):
    id: str = Field(default_factory=lambda: new_id("prompt"))
    name: str = "默认 Prompt"
    version: str = "1.0.0"
    content: str = ""
    created_at: str = Field(default_factory=now_iso)
    updated_at: str = Field(default_factory=now_iso)


class ExtractionTemplate(BaseModel):
    id: str = Field(default_factory=lambda: new_id("tmpl"))
    name: str
    description: str = ""
    version: str = "1.0"
    system_prompt: str = ""
    prompt_profiles: List[PromptProfile] = Field(default_factory=list)
    active_prompt_id: Optional[str] = None
    modeling: Dict[str, Any] = Field(default_factory=dict)
    dimensions: List[DimensionConfig] = Field(default_factory=list)
    created_at: str = Field(default_factory=now_iso)
    updated_at: str = Field(default_factory=now_iso)


class Evidence(BaseModel):
    id: str = Field(default_factory=lambda: new_id("ev"))
    paper_id: str
    chunk_id: Optional[str] = None
    section_title: Optional[str] = None
    page_start: Optional[int] = None
    page_end: Optional[int] = None
    quote: str = ""
    relevance: Optional[str] = None


class ExtractedItem(BaseModel):
    id: str = Field(default_factory=lambda: new_id("item"))
    dimension_name: str
    dimension_label: str
    title: str = ""
    content: str = ""
    normalized_value: Any = None
    evidence: List[Evidence] = Field(default_factory=list)
    confidence: float = 0.0
    model_notes: Optional[str] = None
    review_status: ReviewStatus = ReviewStatus.pending
    user_note: Optional[str] = None
    tags: List[str] = Field(default_factory=list)
    review_root_cause: Optional[str] = None
    review_suggested_target: Optional[str] = None
    edited_title: Optional[str] = None
    edited_content: Optional[str] = None
    created_at: str = Field(default_factory=now_iso)
    updated_at: str = Field(default_factory=now_iso)


class ExtractionRun(BaseModel):
    id: str = Field(default_factory=lambda: new_id("run"))
    paper_id: str
    template_id: str
    status: str = "created"
    model: str = ""
    items: List[ExtractedItem] = Field(default_factory=list)
    errors: List[str] = Field(default_factory=list)
    created_at: str = Field(default_factory=now_iso)
    updated_at: str = Field(default_factory=now_iso)


class UserNote(BaseModel):
    id: str = Field(default_factory=lambda: new_id("note"))
    paper_id: Optional[str] = None
    extraction_run_id: Optional[str] = None
    item_id: Optional[str] = None
    material_id: Optional[str] = None
    title: str = ""
    content: str
    tags: List[str] = Field(default_factory=list)
    created_at: str = Field(default_factory=now_iso)
    updated_at: str = Field(default_factory=now_iso)


class MaterialItem(BaseModel):
    id: str = Field(default_factory=lambda: new_id("mat"))
    paper_id: str
    extraction_run_id: str
    extraction_item_id: str
    dimension_name: str
    dimension_label: str
    title: str = ""
    content: str = ""
    evidence: List[Evidence] = Field(default_factory=list)
    review_status: ReviewStatus = ReviewStatus.pending
    tags: List[str] = Field(default_factory=list)
    user_note: Optional[str] = None
    created_at: str = Field(default_factory=now_iso)
    updated_at: str = Field(default_factory=now_iso)


class RunExtractionRequest(BaseModel):
    paper_id: str
    template_id: str
    dimension_names: Optional[List[str]] = None


class ReviewUpdateRequest(BaseModel):
    status: ReviewStatus
    edited_title: Optional[str] = None
    edited_content: Optional[str] = None
    user_note: Optional[str] = None
    tags: List[str] = Field(default_factory=list)
    root_cause: Optional[str] = None
    suggested_target: Optional[str] = None


class ReviewRecord(BaseModel):
    id: str = Field(default_factory=lambda: new_id("review"))
    paper_id: str
    profile_id: str
    profile_version: str = ""
    dimension_id: str
    dimension_name: str = ""
    extraction_id: str
    result_id: str
    prompt_id: str = ""
    prompt_version: str = ""
    model_name: str = ""
    review_action: ReviewStatus
    review_label: str = ""
    review_comment: Optional[str] = None
    reviewer_edit: Dict[str, Any] = Field(default_factory=dict)
    error_tags: List[str] = Field(default_factory=list)
    root_cause: Optional[str] = None
    suggested_target: Optional[str] = None
    created_at: str = Field(default_factory=now_iso)


class BibTeXImportRequest(BaseModel):
    bibtex_text: str


class DOIImportRequest(BaseModel):
    doi: str
    try_download_pdf: bool = True


class ArxivImportRequest(BaseModel):
    arxiv_id_or_url: str


class ManualPaperRequest(BaseModel):
    metadata: PaperMetadata
    full_text: str = ""


class SearchMaterialsResponse(BaseModel):
    query: str = ""
    total: int
    items: List[MaterialItem]


class CompareReport(BaseModel):
    paper_ids: List[str]
    template_id: Optional[str] = None
    dimensions: List[str]
    matrix: List[Dict[str, Any]]
    gaps: List[Dict[str, Any]] = Field(default_factory=list)
