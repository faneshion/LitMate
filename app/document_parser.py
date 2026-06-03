from __future__ import annotations

import re
import time
from pathlib import Path
from typing import Dict, List, Optional, Tuple

from .config import settings
from .mineru_parser import parse_pdf_with_mineru
from .models import DocumentChunk, FigureInfo, Paper, PaperMetadata, ReferenceInfo, Section, new_id
from .section_policy import classify_section_title, section_label

SECTION_PATTERNS = [
    r"^\s*(abstract)\s*$",
    r"^\s*(\d+(?:\.\d+)*\s+)?(introduction|related work|background|method|methodology|approach|experiments?|evaluation|results?|discussion|limitations?|conclusion|references|appendix)\s*$",
]

FIGURE_RE = re.compile(r"(?is)(Figure|Fig\.)\s*([0-9]+)[:.\s-]+(.{20,500}?)(?=\n\s*(?:Figure|Fig\.|Table|\d+\s+[A-Z]|References|$))")
TABLE_RE = re.compile(r"(?is)(Table)\s*([0-9]+)[:.\s-]+(.{20,500}?)(?=\n\s*(?:Figure|Fig\.|Table|\d+\s+[A-Z]|References|$))")
ALGORITHM_RE = re.compile(r"(?is)(Algorithm)\s*([0-9]+)[:.\s-]+(.{20,1500}?)(?=\n\s*(?:Algorithm|Figure|Fig\.|Table|\d+\s+[A-Z]|References|$))")
DOI_RE = re.compile(r"10\.\d{4,9}/[-._;()/:A-Z0-9]+", re.I)
YEAR_RE = re.compile(r"\b(19|20)\d{2}\b")


def parse_document(file_path: Path, paper_id: Optional[str] = None, metadata: Optional[PaperMetadata] = None) -> Paper:
    started_at = time.perf_counter()
    paper = Paper(id=paper_id or new_id("paper"), metadata=metadata or PaperMetadata(), file_path=str(file_path))
    suffix = file_path.suffix.lower()
    if suffix == ".pdf":
        mineru_result = parse_pdf_with_mineru(file_path, paper.id, pdf_url=paper.metadata.pdf_url)
        if mineru_result:
            text = normalize_text(mineru_result.text)
            paper.figures = mineru_result.figures or extract_figures_from_text(text)
            main_text = strip_common_pdf_noise(strip_figure_table_captions(text))
            paper.full_text = main_text
            paper.sections = detect_sections_from_text(main_text)
            paper.references = extract_references(main_text)
            paper.metadata.extra = {
                **paper.metadata.extra,
                "parser": mineru_result.engine or "mineru",
                "mineru_output_dir": str(mineru_result.output_dir),
                "mineru_markdown_path": str(mineru_result.markdown_path) if mineru_result.markdown_path else None,
                "mineru_content_json_path": str(mineru_result.content_json_path) if mineru_result.content_json_path else None,
            }
        else:
            pages = extract_pdf_pages(file_path)
            pages = remove_repeated_marginal_lines(pages)
            text = "\n\n".join(f"[Page {p}]\n{t}" for p, t in pages)
            paper.figures = extract_figures_from_text(text)
            main_pages = [(page_num, strip_common_pdf_noise(strip_figure_table_captions(page_text))) for page_num, page_text in pages]
            main_text = "\n\n".join(f"[Page {p}]\n{t}" for p, t in main_pages)
            paper.full_text = main_text
            paper.sections = detect_sections_from_pages(main_pages)
            paper.references = extract_references(main_text)
            mineru_error_path = settings.mineru_output_dir / paper.id / "mineru_error.txt"
            mineru_error = ""
            if mineru_error_path.exists():
                mineru_error = mineru_error_path.read_text(encoding="utf-8", errors="ignore")[:1200]
            paper.metadata.extra = {
                **paper.metadata.extra,
                "parser": "pypdf",
                "mineru_error": mineru_error or None,
            }
        if not any(fig.image_path for fig in paper.figures):
            try_extract_pdf_images(file_path, paper)
    else:
        text = file_path.read_text(encoding="utf-8", errors="ignore")
        paper.full_text = text
        paper.figures = extract_figures_from_text(text)
        paper.sections = detect_sections_from_text(text)
        paper.references = extract_references(text)
    paper.chunks = chunk_paper(paper)
    paper.metadata.extra = {
        **paper.metadata.extra,
        "parse_duration_seconds": round(time.perf_counter() - started_at, 3),
    }
    text_path = settings.data_dir / "texts" / f"{paper.id}.txt"
    text_path.parent.mkdir(parents=True, exist_ok=True)
    text_path.write_text(paper.full_text, encoding="utf-8")
    paper.text_path = str(text_path)
    return paper


def extract_pdf_pages(file_path: Path) -> List[Tuple[int, str]]:
    try:
        from pypdf import PdfReader
    except Exception as exc:  # pragma: no cover
        raise RuntimeError("PDF 解析需要安装 pypdf。请运行 pip install -r requirements.txt") from exc

    reader = PdfReader(str(file_path))
    pages: List[Tuple[int, str]] = []
    for idx, page in enumerate(reader.pages, start=1):
        try:
            text = page.extract_text() or ""
        except Exception:
            text = ""
        pages.append((idx, normalize_text(text)))
    return pages


def normalize_text(text: str) -> str:
    text = text.replace("\x00", " ")
    text = re.sub(r"[ \t]+", " ", text)
    text = re.sub(r"\n{3,}", "\n\n", text)
    return text.strip()


def remove_repeated_marginal_lines(pages: List[Tuple[int, str]]) -> List[Tuple[int, str]]:
    if len(pages) < 3:
        return pages
    candidates: Dict[str, int] = {}
    page_lines: List[Tuple[int, List[str]]] = []
    for page_num, text in pages:
        lines = [line.strip() for line in text.splitlines() if line.strip()]
        page_lines.append((page_num, lines))
        for line in lines[:4] + lines[-4:]:
            key = normalize_marginal_line(line)
            if key:
                candidates[key] = candidates.get(key, 0) + 1
    threshold = max(2, int(len(pages) * 0.35))
    repeated = {key for key, count in candidates.items() if count >= threshold}
    if not repeated:
        return pages
    cleaned: List[Tuple[int, str]] = []
    for page_num, lines in page_lines:
        kept = []
        for index, line in enumerate(lines):
            is_margin = index < 4 or index >= max(0, len(lines) - 4)
            if is_margin and normalize_marginal_line(line) in repeated:
                continue
            if is_margin and is_standalone_page_marker(line):
                continue
            kept.append(line)
        cleaned.append((page_num, normalize_text("\n".join(kept))))
    return cleaned


def normalize_marginal_line(line: str) -> str:
    line = normalize_text(line).lower()
    if not line or len(line) > 160:
        return ""
    line = re.sub(r"\b\d+\b", "#", line)
    line = re.sub(r"\b(page|pp\.?)\s*#\b", "page #", line)
    line = re.sub(r"\s+", " ", line).strip(" -|·")
    if len(line) < 4:
        return ""
    return line


def is_standalone_page_marker(line: str) -> bool:
    line = line.strip()
    return bool(re.match(r"^(?:page\s*)?\d{1,4}$", line, re.I) or re.match(r"^-\s*\d{1,4}\s*-$", line))


def strip_figure_table_captions(text: str) -> str:
    cleaned = text
    for regex in (FIGURE_RE, TABLE_RE, ALGORITHM_RE):
        cleaned = regex.sub("\n", cleaned)
    cleaned = re.sub(r"(?im)^\s*!\[[^\]]*\]\([^)]+\)\s*$", "", cleaned)
    return normalize_text(cleaned)


def strip_common_pdf_noise(text: str) -> str:
    lines = []
    for line in text.splitlines():
        stripped = line.strip()
        if not stripped or is_common_pdf_noise_line(stripped):
            continue
        lines.append(stripped)
    return normalize_text("\n".join(lines))


def is_common_pdf_noise_line(line: str) -> bool:
    lowered = line.lower().strip()
    if is_standalone_page_marker(line):
        return True
    if is_unicode_escape_noise(line):
        return True
    if re.match(r"^arxiv:\d{4}\.\d{4,5}", lowered):
        return True
    if lowered.startswith("copyright") or "all rights reserved" in lowered:
        return True
    if "proceedings of the" in lowered and len(line) < 180:
        return True
    if lowered.startswith("preprint.") and len(line) < 180:
        return True
    if lowered.startswith("*") and any(token in lowered for token in ("corresponding author", "corresponding authors", "equal contribution")):
        return True
    if lowered.startswith("∗") and any(token in lowered for token in ("core contributors", "participants:", "supervision:", "equal contribution")):
        return True
    if lowered.startswith("*") and any(token in lowered for token in ("core contributors", "participants:", "supervision:")):
        return True
    if lowered.startswith(("core contributors:", "participants:", "supervision:")) and len(line) < 800:
        return True
    if lowered.startswith("copy") and len(line) < 80:
        return True
    return False


def is_unicode_escape_noise(line: str) -> bool:
    matches = re.findall(r"/uni[0-9a-fA-F]{8}", line)
    if len(matches) >= 3:
        return True
    return bool(matches and len("".join(matches)) / max(1, len(line)) > 0.35)


def detect_sections_from_pages(pages: List[Tuple[int, str]]) -> List[Section]:
    flat_lines: List[Tuple[int, str]] = []
    for page_num, text in pages:
        for line in text.splitlines():
            line = line.strip()
            if line:
                flat_lines.append((page_num, line))
    return _detect_sections(flat_lines)


def detect_sections_from_text(text: str) -> List[Section]:
    return _detect_sections([(None, line.strip()) for line in text.splitlines() if line.strip()])


def _detect_sections(lines: List[Tuple[Optional[int], str]]) -> List[Section]:
    sections: List[Section] = []
    current: Optional[Section] = None
    buffer: List[str] = []

    def is_heading(line: str) -> bool:
        markdown_heading = re.match(r"^\s{0,3}(#{1,6})\s+(.+?)\s*#*\s*$", line)
        if markdown_heading:
            heading_text = markdown_heading.group(2).strip()
            return 0 < len(heading_text) <= 140
        if len(line) > 120:
            return False
        lowered = line.lower().strip(" .")
        for pat in SECTION_PATTERNS:
            if re.match(pat, lowered, re.I):
                return True
        if re.match(r"^\d+(\.\d+)*\s+[A-Z][A-Za-z ,:&/-]{3,80}$", line):
            return True
        return False

    for page, line in lines:
        if is_heading(line):
            if current:
                current.text = "\n".join(buffer).strip()
                current.end_page = page
                sections.append(current)
            title = clean_section_title(line)
            current = Section(title=title, start_page=page, end_page=page)
            buffer = []
        else:
            if current is None:
                current = Section(title="Document", start_page=page, end_page=page)
            buffer.append(line)
            current.end_page = page
    if current:
        current.text = "\n".join(buffer).strip()
        sections.append(current)
    return sections or [Section(title="Document", text="\n".join(line for _, line in lines))]


def clean_section_title(line: str) -> str:
    line = re.sub(r"^\s{0,3}#{1,6}\s+", "", line).strip()
    line = re.sub(r"\s+#*\s*$", "", line).strip()
    line = re.sub(r"^\d+(?:\.\d+)*\s+", "", line).strip()
    return line or "Section"


def extract_figures_from_text(text: str) -> List[FigureInfo]:
    figures: List[FigureInfo] = []
    for regex, prefix in [(FIGURE_RE, "Figure"), (TABLE_RE, "Table"), (ALGORITHM_RE, "Algorithm")]:
        for match in regex.finditer(text):
            label = f"{prefix} {match.group(2)}"
            caption = normalize_text(match.group(3))[:1200]
            page_match = re.search(r"\[Page\s+(\d+)\]", text[max(0, match.start() - 1000):match.start()])
            page = int(page_match.group(1)) if page_match else None
            figures.append(FigureInfo(label=label, caption=caption, page=page))
    return figures


def try_extract_pdf_images(file_path: Path, paper: Paper) -> None:
    """Best-effort image extraction. Captions remain text-derived.

    This keeps the prototype useful even when PyMuPDF is unavailable.
    """
    try:
        import fitz  # type: ignore
    except Exception:
        return
    out_dir = settings.figure_dir / paper.id
    out_dir.mkdir(parents=True, exist_ok=True)
    try:
        doc = fitz.open(str(file_path))
        image_count = 0
        for page_index in range(len(doc)):
            for image_index, img in enumerate(doc[page_index].get_images(full=True), start=1):
                xref = img[0]
                base_image = doc.extract_image(xref)
                ext = base_image.get("ext", "png")
                image_bytes = base_image.get("image")
                if not image_bytes:
                    continue
                image_count += 1
                image_path = out_dir / f"page_{page_index+1}_img_{image_index}.{ext}"
                image_path.write_bytes(image_bytes)
                if image_count <= len(paper.figures) and not paper.figures[image_count - 1].image_path:
                    paper.figures[image_count - 1].image_path = str(image_path)
        doc.close()
    except Exception:
        return


def extract_references(text: str) -> List[ReferenceInfo]:
    lower = text.lower()
    idx = lower.rfind("references")
    if idx == -1:
        return []
    ref_text = text[idx + len("references"):]
    ref_text = re.sub(r"\[Page\s+\d+\]", "", ref_text)
    candidates = re.split(r"\n\s*(?:\[?\d+\]?\.|\[\d+\])\s+", ref_text)
    refs: List[ReferenceInfo] = []
    for raw in candidates:
        raw = normalize_text(raw)
        if len(raw) < 30:
            continue
        doi_match = DOI_RE.search(raw)
        year_match = YEAR_RE.search(raw)
        refs.append(
            ReferenceInfo(
                raw=raw[:2000],
                doi=doi_match.group(0) if doi_match else None,
                year=int(year_match.group(0)) if year_match else None,
            )
        )
        if len(refs) >= 300:
            break
    return refs


def chunk_paper(paper: Paper) -> List[DocumentChunk]:
    chunks: List[DocumentChunk] = []
    max_chars = settings.max_chunk_chars
    overlap = settings.chunk_overlap_chars
    sections = paper.sections or [Section(title="Document", text=paper.full_text)]
    for section in sections:
        text = section.text or ""
        if not text.strip():
            continue
        start = 0
        while start < len(text):
            end = min(len(text), start + max_chars)
            chunk_text = text[start:end].strip()
            if chunk_text:
                section_type = classify_section_title(section.title)
                chunks.append(
                    DocumentChunk(
                        paper_id=paper.id,
                        section_title=section.title,
                        section_type=section_type,
                        section_label=section_label(section_type),
                        page_start=section.start_page,
                        page_end=section.end_page,
                        text=chunk_text,
                        token_estimate=max(1, len(chunk_text) // 4),
                    )
                )
            if end >= len(text):
                break
            start = max(0, end - overlap)
    return chunks
