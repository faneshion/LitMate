from __future__ import annotations

import html
import json
import re
import xml.etree.ElementTree as ET
from pathlib import Path
from typing import Any, Dict, List, Optional, Tuple
from urllib.parse import quote, urlparse

import requests

from .config import settings
from .document_parser import parse_document
from .models import ImportSource, Paper, PaperMetadata, new_id


def safe_filename(name: str, default: str = "paper") -> str:
    name = re.sub(r"[^A-Za-z0-9._-]+", "_", name).strip("_")
    return name[:160] or default


def download_file(url: str, suffix: str = ".pdf") -> Path:
    resp = requests.get(url, timeout=60, headers={"User-Agent": "lit-research-assistant/0.2"})
    resp.raise_for_status()
    filename = safe_filename(Path(urlparse(url).path).name or new_id("download"))
    if not filename.lower().endswith(suffix):
        filename += suffix
    out_path = settings.upload_dir / filename
    out_path.write_bytes(resp.content)
    return out_path


def import_arxiv(arxiv_id_or_url: str) -> Paper:
    arxiv_id = normalize_arxiv_id(arxiv_id_or_url)
    pdf_input = "/pdf/" in arxiv_id_or_url.lower()
    metadata = fetch_arxiv_html_metadata(arxiv_id) if pdf_input else fetch_arxiv_metadata(arxiv_id)
    if not metadata:
        metadata = PaperMetadata(
            title=f"arXiv:{arxiv_id}",
            arxiv_id=arxiv_id,
            url=f"https://arxiv.org/abs/{arxiv_id}",
            pdf_url=f"https://arxiv.org/pdf/{arxiv_id}.pdf",
            extra={"metadata_status": "fallback_pdf_only"},
        )
    pdf_url = metadata.pdf_url or f"https://arxiv.org/pdf/{arxiv_id}.pdf"
    pdf_path = download_file(pdf_url, ".pdf")
    paper = parse_document(pdf_path, metadata=metadata)
    paper.source = ImportSource.arxiv
    return paper


def fetch_arxiv_metadata(arxiv_id: str) -> Optional[PaperMetadata]:
    api_url = f"https://export.arxiv.org/api/query?id_list={quote(arxiv_id)}&max_results=1"
    try:
        resp = requests.get(api_url, timeout=15, headers={"User-Agent": "lit-research-assistant/0.2"})
        resp.raise_for_status()
        root = ET.fromstring(resp.text)
    except Exception:
        return fetch_arxiv_html_metadata(arxiv_id)

    ns = {"atom": "http://www.w3.org/2005/Atom", "arxiv": "http://arxiv.org/schemas/atom"}
    entry = root.find("atom:entry", ns)
    if entry is None:
        return fetch_arxiv_html_metadata(arxiv_id)
    title = clean_xml_text(entry.findtext("atom:title", default="Untitled", namespaces=ns))
    abstract = clean_xml_text(entry.findtext("atom:summary", default="", namespaces=ns))
    authors = [clean_xml_text(a.findtext("atom:name", default="", namespaces=ns)) for a in entry.findall("atom:author", ns)]
    published = entry.findtext("atom:published", default="", namespaces=ns)
    year = int(published[:4]) if published[:4].isdigit() else None
    pdf_url = None
    for link in entry.findall("atom:link", ns):
        if link.attrib.get("title") == "pdf" or link.attrib.get("type") == "application/pdf":
            pdf_url = link.attrib.get("href")
            break
    return PaperMetadata(
        title=title,
        authors=[a for a in authors if a],
        year=year,
        abstract=abstract,
        arxiv_id=arxiv_id,
        url=f"https://arxiv.org/abs/{arxiv_id}",
        pdf_url=pdf_url or f"https://arxiv.org/pdf/{arxiv_id}.pdf",
        extra={"published": published, "metadata_status": "arxiv_api"},
    )


def fetch_arxiv_html_metadata(arxiv_id: str) -> Optional[PaperMetadata]:
    url = f"https://arxiv.org/abs/{arxiv_id}"
    try:
        resp = requests.get(url, timeout=20, headers={"User-Agent": "lit-research-assistant/0.2"})
        resp.raise_for_status()
    except Exception:
        return None
    text = resp.text
    title = clean_html_fragment(_match_html(text, r'<h1[^>]*class="title[^"]*"[^>]*>(.*?)</h1>'))
    title = re.sub(r"^Title:\s*", "", title, flags=re.I).strip() or f"arXiv:{arxiv_id}"
    authors_block = _match_html(text, r'<div[^>]*class="authors"[^>]*>(.*?)</div>')
    authors = [clean_html_fragment(a) for a in re.findall(r"<a[^>]*>(.*?)</a>", authors_block, flags=re.S)]
    abstract = clean_html_fragment(_match_html(text, r'<blockquote[^>]*class="abstract[^"]*"[^>]*>(.*?)</blockquote>'))
    abstract = re.sub(r"^Abstract:\s*", "", abstract, flags=re.I).strip() or None
    year = arxiv_year(arxiv_id)
    return PaperMetadata(
        title=title,
        authors=[a for a in authors if a],
        year=year,
        abstract=abstract,
        arxiv_id=arxiv_id,
        url=url,
        pdf_url=f"https://arxiv.org/pdf/{arxiv_id}.pdf",
        extra={"metadata_status": "arxiv_html"},
    )


def _match_html(text: str, pattern: str) -> str:
    match = re.search(pattern, text, flags=re.S | re.I)
    return match.group(1) if match else ""


def clean_html_fragment(fragment: str) -> str:
    fragment = re.sub(r"<span[^>]*class=\"descriptor\"[^>]*>.*?</span>", "", fragment, flags=re.S | re.I)
    fragment = re.sub(r"<[^>]+>", " ", fragment)
    return re.sub(r"\s+", " ", html.unescape(fragment)).strip()


def arxiv_year(arxiv_id: str) -> Optional[int]:
    match = re.match(r"^(\d{2})(\d{2})\.\d+", arxiv_id)
    if not match:
        return None
    yy = int(match.group(1))
    return 2000 + yy if yy < 90 else 1900 + yy


def normalize_arxiv_id(value: str) -> str:
    value = value.strip()
    value = value.replace("https://arxiv.org/abs/", "").replace("http://arxiv.org/abs/", "")
    value = value.replace("https://arxiv.org/pdf/", "").replace("http://arxiv.org/pdf/", "")
    value = value.replace(".pdf", "")
    return value


def clean_xml_text(text: str) -> str:
    return re.sub(r"\s+", " ", text or "").strip()


def import_doi(doi: str, try_download_pdf: bool = True) -> Paper:
    normalized = normalize_doi(doi)
    url = f"https://api.crossref.org/works/{quote(normalized, safe='')}"
    resp = requests.get(url, timeout=30, headers={"User-Agent": "lit-research-assistant/0.2"})
    resp.raise_for_status()
    message = resp.json().get("message", {})
    metadata = metadata_from_crossref(message, normalized)
    pdf_url = pick_pdf_url_from_crossref(message)
    metadata.pdf_url = pdf_url
    if try_download_pdf and pdf_url:
        pdf_path = download_file(pdf_url, ".pdf")
        paper = parse_document(pdf_path, metadata=metadata)
    else:
        paper = Paper(metadata=metadata, full_text=metadata.abstract or "", source=ImportSource.doi)
        paper.chunks = []
    paper.source = ImportSource.doi
    return paper


def normalize_doi(value: str) -> str:
    value = value.strip()
    value = re.sub(r"^https?://(dx\.)?doi\.org/", "", value, flags=re.I)
    value = value.replace("doi:", "").strip()
    return value


def metadata_from_crossref(message: Dict[str, Any], doi: str) -> PaperMetadata:
    title = (message.get("title") or ["Untitled"])[0]
    authors = []
    for a in message.get("author", []) or []:
        name = " ".join(x for x in [a.get("given"), a.get("family")] if x)
        if name:
            authors.append(name)
    year = None
    for key in ["published-print", "published-online", "issued"]:
        parts = (((message.get(key) or {}).get("date-parts") or [[]])[0])
        if parts and isinstance(parts[0], int):
            year = parts[0]
            break
    venue = None
    if message.get("container-title"):
        venue = message.get("container-title", [None])[0]
    abstract = strip_xml_tags(message.get("abstract")) if message.get("abstract") else None
    return PaperMetadata(
        title=title,
        authors=authors,
        year=year,
        venue=venue,
        abstract=abstract,
        doi=doi,
        url=message.get("URL"),
        extra={"crossref_type": message.get("type"), "publisher": message.get("publisher")},
    )


def pick_pdf_url_from_crossref(message: Dict[str, Any]) -> Optional[str]:
    for link in message.get("link", []) or []:
        content_type = (link.get("content-type") or "").lower()
        intended = (link.get("intended-application") or "").lower()
        url = link.get("URL")
        if url and ("pdf" in content_type or "pdf" in intended or url.lower().endswith(".pdf")):
            return url
    return None


def strip_xml_tags(text: str) -> str:
    return re.sub(r"<[^>]+>", "", text or "").strip()


def import_bibtex(bibtex_text: str) -> Paper:
    entries = parse_bibtex_entries(bibtex_text)
    if not entries:
        raise ValueError("BibTeX 内容中没有解析到条目。")
    entry = entries[0]
    year = None
    if str(entry.get("year", "")).isdigit():
        year = int(entry["year"])
    authors = split_bibtex_authors(entry.get("author", ""))
    metadata = PaperMetadata(
        title=strip_bibtex_braces(entry.get("title", "Untitled")),
        authors=authors,
        year=year,
        venue=entry.get("journal") or entry.get("booktitle") or entry.get("publisher"),
        abstract=entry.get("abstract"),
        doi=entry.get("doi"),
        url=entry.get("url"),
        bibtex=bibtex_text,
        extra={k: v for k, v in entry.items() if k not in {"title", "author", "year", "journal", "booktitle", "doi", "url", "abstract"}},
    )
    paper = Paper(metadata=metadata, full_text=metadata.abstract or "", source=ImportSource.bibtex)
    return paper


def parse_bibtex_entries(text: str) -> List[Dict[str, str]]:
    try:
        import bibtexparser  # type: ignore

        db = bibtexparser.loads(text)
        return [dict(e) for e in db.entries]
    except Exception:
        pass
    entries: List[Dict[str, str]] = []
    for block in re.findall(r"@\w+\s*\{[^@]+", text, flags=re.S):
        entry: Dict[str, str] = {}
        for key, value in re.findall(r"(\w+)\s*=\s*[\{\"](.+?)[\}\"]\s*,?\s*(?=\w+\s*=|\}\s*$)", block, flags=re.S):
            entry[key.lower()] = strip_bibtex_braces(value.strip())
        if entry:
            entries.append(entry)
    return entries


def strip_bibtex_braces(text: str) -> str:
    return text.replace("{", "").replace("}", "").strip()


def split_bibtex_authors(text: str) -> List[str]:
    return [strip_bibtex_braces(a.strip()) for a in re.split(r"\s+and\s+", text or "") if a.strip()]
