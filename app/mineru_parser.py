from __future__ import annotations

import json
import re
import shutil
import subprocess
import sys
import traceback
import time
import zipfile
from dataclasses import dataclass, field
from io import BytesIO
from pathlib import Path
from typing import Any, Dict, List, Optional

import requests

from .config import settings
from .models import FigureInfo


@dataclass
class MinerUParseResult:
    text: str
    output_dir: Path
    markdown_path: Optional[Path] = None
    content_json_path: Optional[Path] = None
    figures: List[FigureInfo] = field(default_factory=list)
    engine: str = "mineru"


def parse_pdf_with_mineru(file_path: Path, paper_id: str, pdf_url: Optional[str] = None) -> Optional[MinerUParseResult]:
    """Run MinerU when available and convert its output into project data.

    MinerU is intentionally optional: PDF import must still work on machines
    where the heavy parsing stack has not been installed yet.
    """
    if not settings.mineru_enabled:
        return None
    provider = settings.paper_parser_provider.lower().strip()
    if provider == "pypdf":
        return None

    output_dir = settings.mineru_output_dir / paper_id
    if output_dir.exists():
        shutil.rmtree(output_dir)
    output_dir.mkdir(parents=True, exist_ok=True)

    errors: List[str] = []
    if provider in {"auto", "online_mineru"} and settings.mineru_online_enabled and settings.mineru_online_token:
        try:
            _run_mineru_online(file_path, output_dir, paper_id, pdf_url)
            result = _load_mineru_output(output_dir)
            if result:
                result.engine = "mineru_online"
                return result
            errors.append("online: task completed but no readable markdown/content_list was found")
        except Exception as exc:
            errors.append(f"online: {exc}\n{traceback.format_exc(limit=8)}")
            if provider == "online_mineru":
                _write_mineru_error(output_dir, "\n\n".join(errors))
                return None

    if provider == "online_mineru":
        _write_mineru_error(output_dir, "\n\n".join(errors) or "MinerU online parser is not configured")
        return None

    if provider not in {"auto", "local_mineru"}:
        _write_mineru_error(output_dir, f"Unknown paper parser provider: {settings.paper_parser_provider}")
        return None

    try:
        _run_mineru_python_api(file_path, output_dir)
        result = _load_mineru_output(output_dir)
        if result:
            result.engine = "mineru_python"
        return result
    except Exception as exc:
        errors.append(f"python_api: {exc}\n{traceback.format_exc(limit=8)}")

    command = _resolve_command(settings.mineru_command)
    if not command:
        _write_mineru_error(output_dir, "\n\n".join(errors) or "MinerU local command was not found")
        return None

    cmd = [
        str(command),
        "-p",
        str(file_path),
        "-o",
        str(output_dir),
        "-b",
        settings.mineru_backend,
        "-m",
        "auto",
        "-l",
        "en",
    ]
    try:
        subprocess.run(
            cmd,
            check=True,
            capture_output=True,
            text=True,
            encoding="utf-8",
            errors="replace",
            timeout=settings.mineru_timeout_seconds,
        )
    except Exception as exc:
        errors.append(f"cli: {exc}")
        if isinstance(exc, subprocess.CalledProcessError):
            errors.append(f"stdout:\n{exc.stdout or ''}\nstderr:\n{exc.stderr or ''}")
        _write_mineru_error(output_dir, "\n\n".join(errors))
        return None

    result = _load_mineru_output(output_dir)
    if result:
        result.engine = "mineru_cli"
    return result


def _run_mineru_online(file_path: Path, output_dir: Path, paper_id: str, pdf_url: Optional[str] = None) -> None:
    if pdf_url and pdf_url.lower().startswith(("http://", "https://")):
        _run_mineru_online_url_task(pdf_url, output_dir)
        return
    _run_mineru_online_upload_task(file_path, output_dir, paper_id)


def _online_api_url(path: str) -> str:
    return settings.mineru_online_base_url.rstrip("/") + path


def _online_headers(content_type: Optional[str] = "application/json") -> Dict[str, str]:
    headers = {"Authorization": f"Bearer {settings.mineru_online_token}"}
    if content_type:
        headers["Content-Type"] = content_type
    return headers


def _post_online_json(path: str, payload: Dict[str, Any]) -> Dict[str, Any]:
    response = requests.post(
        _online_api_url(path),
        headers=_online_headers(),
        json=payload,
        timeout=60,
    )
    response.raise_for_status()
    return _online_json(response)


def _get_online_json(path: str) -> Dict[str, Any]:
    response = requests.get(
        _online_api_url(path),
        headers=_online_headers(),
        timeout=60,
    )
    response.raise_for_status()
    return _online_json(response)


def _online_json(response: requests.Response) -> Dict[str, Any]:
    data = response.json()
    if isinstance(data, dict):
        code = data.get("code")
        if code not in (None, 0, 200, "0", "200"):
            raise RuntimeError(f"MinerU online API returned code={code}: {data.get('msg') or data.get('message') or data}")
        return data
    raise RuntimeError("MinerU online API returned a non-object JSON response")


def _run_mineru_online_url_task(pdf_url: str, output_dir: Path) -> None:
    payload = {
        "url": pdf_url,
        "model_version": settings.mineru_online_model_version,
        "is_ocr": True,
        "enable_formula": True,
        "enable_table": True,
        "language": settings.mineru_online_language,
    }
    data = _post_online_json("/api/v4/extract/task", payload).get("data", {})
    task_id = _find_first_value(data, ("task_id", "taskId", "id"))
    if not task_id:
        raise RuntimeError(f"MinerU online URL task did not return task_id: {data}")
    _poll_online_result(f"/api/v4/extract/task/{task_id}", output_dir)


def _run_mineru_online_upload_task(file_path: Path, output_dir: Path, paper_id: str) -> None:
    payload = {
        "enable_formula": True,
        "enable_table": True,
        "language": settings.mineru_online_language,
        "model_version": settings.mineru_online_model_version,
        "files": [
            {
                "name": file_path.name,
                "is_ocr": True,
                "data_id": paper_id,
            }
        ],
    }
    data = _post_online_json("/api/v4/file-urls/batch", payload).get("data", {})
    batch_id = _find_first_value(data, ("batch_id", "batchId"))
    upload_url = _find_upload_url(data)
    if not batch_id or not upload_url:
        raise RuntimeError(f"MinerU online upload task did not return batch_id/upload url: {data}")
    with file_path.open("rb") as f:
        response = requests.put(upload_url, data=f, timeout=300)
    response.raise_for_status()
    _poll_online_result(f"/api/v4/extract-results/batch/{batch_id}", output_dir)


def _poll_online_result(path: str, output_dir: Path) -> None:
    deadline = time.monotonic() + settings.mineru_online_timeout_seconds
    last_data: Any = None
    while time.monotonic() < deadline:
        data = _get_online_json(path).get("data", {})
        last_data = data
        zip_url = _find_first_value(data, ("full_zip_url", "fullZipUrl", "zip_url", "zipUrl"))
        if zip_url:
            _download_and_extract_online_zip(str(zip_url), output_dir)
            return
        status_text = " ".join(str(v).lower() for v in _find_values(data, ("state", "status", "extract_status")))
        error_text = _find_first_value(data, ("err_msg", "error", "message", "msg"))
        if any(token in status_text for token in ("fail", "error")):
            raise RuntimeError(f"MinerU online task failed: {error_text or data}")
        time.sleep(max(1.0, settings.mineru_online_poll_interval_seconds))
    raise TimeoutError(f"MinerU online task timed out. Last response: {last_data}")


def _download_and_extract_online_zip(zip_url: str, output_dir: Path) -> None:
    response = requests.get(zip_url, timeout=300)
    response.raise_for_status()
    output_dir.mkdir(parents=True, exist_ok=True)
    with zipfile.ZipFile(BytesIO(response.content)) as archive:
        root = output_dir.resolve()
        for member in archive.infolist():
            target = (output_dir / member.filename).resolve()
            if not str(target).startswith(str(root)):
                continue
            archive.extract(member, output_dir)


def _find_first_value(value: Any, keys: tuple[str, ...]) -> Optional[Any]:
    values = _find_values(value, keys)
    return values[0] if values else None


def _find_values(value: Any, keys: tuple[str, ...]) -> List[Any]:
    found: List[Any] = []
    if isinstance(value, dict):
        for key, item in value.items():
            if key in keys and item not in (None, ""):
                found.append(item)
            found.extend(_find_values(item, keys))
    elif isinstance(value, list):
        for item in value:
            found.extend(_find_values(item, keys))
    return found


def _find_upload_url(data: Any) -> Optional[str]:
    for key in ("upload_url", "uploadUrl", "url", "file_url", "fileUrl"):
        value = _find_first_value(data, (key,))
        if isinstance(value, str) and value.startswith(("http://", "https://")):
            return value
    return None


def _run_mineru_python_api(file_path: Path, output_dir: Path) -> None:
    from mineru.cli.common import do_parse

    do_parse(
        output_dir=str(output_dir),
        pdf_file_names=[file_path.stem],
        pdf_bytes_list=[file_path.read_bytes()],
        p_lang_list=["en"],
        backend=settings.mineru_backend,
        parse_method="auto",
        formula_enable=True,
        table_enable=True,
        f_draw_layout_bbox=False,
        f_draw_span_bbox=False,
        f_dump_model_output=False,
        f_dump_orig_pdf=False,
        f_dump_content_list=True,
    )


def _write_mineru_error(output_dir: Path, text: str) -> None:
    try:
        output_dir.mkdir(parents=True, exist_ok=True)
        (output_dir / "mineru_error.txt").write_text(text[:12000], encoding="utf-8", errors="ignore")
    except Exception:
        return


def mineru_runtime_status() -> Dict[str, Any]:
    command = _resolve_command(settings.mineru_command)
    return {
        "enabled": settings.mineru_enabled,
        "paper_parser_provider": settings.paper_parser_provider,
        "command": settings.mineru_command,
        "available": command is not None,
        "resolved_command": str(command) if command else None,
        "backend": settings.mineru_backend,
        "online_enabled": settings.mineru_online_enabled,
        "online_token_configured": bool(settings.mineru_online_token),
        "online_base_url": settings.mineru_online_base_url,
        "online_model_version": settings.mineru_online_model_version,
    }


def _resolve_command(command: str) -> Optional[Path]:
    found = shutil.which(command)
    if found:
        return Path(found)

    suffix = ".exe" if sys.platform.startswith("win") else ""
    local_script = Path(sys.executable).resolve().parent / f"{command}{suffix}"
    if local_script.exists():
        return local_script
    return None


def _load_mineru_output(output_dir: Path) -> Optional[MinerUParseResult]:
    markdown_path = _pick_largest(output_dir.rglob("*.md"))
    content_json_path = _pick_content_json(output_dir)
    figures = _figures_from_content_json(content_json_path, output_dir) if content_json_path else []

    text = ""
    if content_json_path:
        text = _text_from_content_json(content_json_path)
    if not text and markdown_path:
        text = markdown_path.read_text(encoding="utf-8", errors="ignore").strip()
    if not text:
        return None

    return MinerUParseResult(
        text=text,
        output_dir=output_dir,
        markdown_path=markdown_path,
        content_json_path=content_json_path,
        figures=figures,
    )


def _pick_largest(paths: Any) -> Optional[Path]:
    candidates = [p for p in paths if p.is_file()]
    if not candidates:
        return None
    return max(candidates, key=lambda p: p.stat().st_size)


def _pick_content_json(output_dir: Path) -> Optional[Path]:
    preferred = [p for p in output_dir.rglob("*content_list*.json") if p.is_file()]
    if preferred:
        return _pick_largest(preferred)
    return _pick_largest(output_dir.rglob("*.json"))


def _load_json_list(path: Path) -> List[Dict[str, Any]]:
    try:
        data = json.loads(path.read_text(encoding="utf-8", errors="ignore"))
    except Exception:
        return []
    return _flatten_blocks(data)


def _flatten_blocks(data: Any) -> List[Dict[str, Any]]:
    if isinstance(data, list):
        blocks: List[Dict[str, Any]] = []
        for item in data:
            blocks.extend(_flatten_blocks(item))
        return blocks
    if isinstance(data, dict):
        for key in ("content", "contents", "pages", "items", "blocks"):
            value = data.get(key)
            if isinstance(value, list):
                return _flatten_blocks(value)
        if "type" in data:
            return [data]
    return []


def _text_from_content_json(path: Path) -> str:
    lines: List[str] = []
    for block in _load_json_list(path):
        block_type = _block_type(block)
        if _is_noise_block(block_type) or _is_visual_block(block):
            continue
        text = _main_text(block)
        if not text:
            continue
        if "title" in block_type:
            level = _title_level(block)
            lines.append(f"{'#' * max(1, min(level, 6))} {text}")
        elif "equation" in block_type or "formula" in block_type:
            lines.append(f"$$\n{text}\n$$")
        else:
            lines.append(text)
    return "\n\n".join(x.strip() for x in lines if x and x.strip())


def _figures_from_content_json(path: Path, output_dir: Path) -> List[FigureInfo]:
    figures: List[FigureInfo] = []
    image_count = 0
    table_count = 0
    algorithm_count = 0
    for block in _load_json_list(path):
        if not _is_visual_block(block):
            continue
        block_type = _block_type(block)
        caption = _visual_caption(block)
        body = _visual_body(block)
        combined = "\n".join(x for x in [caption, body] if x and x.strip()).strip()
        if not combined:
            combined = _main_text(block)
        if not combined:
            continue
        if _is_algorithm_block(block):
            number = _label_number(combined)
            if number:
                label = f"Algorithm {number}"
                algorithm_count = max(algorithm_count, int(number))
            else:
                algorithm_count += 1
                label = f"Algorithm {algorithm_count}"
        elif "table" in block_type:
            number = _label_number(combined)
            if number:
                label = f"Table {number}"
                table_count = max(table_count, int(number))
            else:
                table_count += 1
                label = f"Table {table_count}"
        elif "chart" in block_type:
            number = _label_number(combined)
            if number:
                label = f"Figure {number}"
                image_count = max(image_count, int(number))
            else:
                image_count += 1
                label = f"Figure {image_count}"
        else:
            number = _label_number(combined)
            if number:
                label = f"Figure {number}"
                image_count = max(image_count, int(number))
            else:
                image_count += 1
                label = f"Figure {image_count}"
        figures.append(
            FigureInfo(
                label=label,
                caption=combined[:3000],
                page=_page_number(block),
                image_path=_resolve_image_path(block, output_dir),
            )
        )
    return _dedupe_figures(figures)


def _dedupe_figures(figures: List[FigureInfo]) -> List[FigureInfo]:
    merged: List[FigureInfo] = []
    by_label: Dict[str, FigureInfo] = {}
    for figure in figures:
        key = figure.label.strip().lower()
        if not key or key not in by_label:
            by_label[key] = figure
            merged.append(figure)
            continue
        existing = by_label[key]
        if figure.caption and figure.caption not in existing.caption:
            existing.caption = "\n".join(x for x in [existing.caption, figure.caption] if x).strip()[:3000]
        if not existing.image_path and figure.image_path:
            existing.image_path = figure.image_path
        if existing.page is None and figure.page is not None:
            existing.page = figure.page
    return merged


def _first_text(block: Dict[str, Any], keys: tuple[str, ...]) -> str:
    for key in keys:
        value = block.get(key)
        if isinstance(value, str) and value.strip():
            return value.strip()
    return ""


def _block_type(block: Dict[str, Any]) -> str:
    block_type = str(block.get("type") or block.get("category") or "").lower()
    sub_type = str(block.get("sub_type") or block.get("subtype") or "").lower()
    if block_type == "code" and sub_type:
        return f"{block_type}:{sub_type}"
    return block_type


def _content(block: Dict[str, Any]) -> Any:
    return block.get("content") if isinstance(block.get("content"), (dict, list, str)) else {}


def _flatten_text(value: Any) -> str:
    if isinstance(value, str):
        return value.strip()
    if isinstance(value, list):
        return "\n".join(x for x in (_flatten_text(item) for item in value) if x)
    if isinstance(value, dict):
        preferred = []
        for key in (
            "text",
            "content",
            "paragraph_content",
            "title_content",
            "math_content",
            "item_content",
            "code_content",
            "algorithm_content",
            "html",
        ):
            if key in value:
                preferred.append(_flatten_text(value.get(key)))
        if preferred:
            return "\n".join(x for x in preferred if x)
        return "\n".join(x for x in (_flatten_text(v) for v in value.values()) if x)
    return ""


def _main_text(block: Dict[str, Any]) -> str:
    content = _content(block)
    if isinstance(content, dict):
        block_type = _block_type(block)
        if "title" in block_type:
            return _flatten_text(content.get("title_content"))
        if "equation" in block_type or "formula" in block_type:
            return _flatten_text(content.get("math_content") or content.get("latex"))
        if "list" in block_type:
            return _flatten_text(content.get("list_items"))
        return _flatten_text(
            content.get("paragraph_content")
            or content.get("text")
            or content.get("content")
            or content
        )
    return _first_text(block, ("text", "md", "latex", "html", "content"))


def _title_level(block: Dict[str, Any]) -> int:
    if isinstance(_content(block), dict):
        value = _content(block).get("level")
    else:
        value = block.get("text_level") or block.get("level")
    try:
        return int(value or 1)
    except (TypeError, ValueError):
        return 1


def _is_noise_block(block_type: str) -> bool:
    return any(
        token in block_type
        for token in (
            "header",
            "footer",
            "page_number",
            "page-number",
            "aside",
            "footnote",
        )
    )


def _is_algorithm_block(block: Dict[str, Any]) -> bool:
    block_type = _block_type(block)
    text = _first_text(block, ("text", "md", "html")) or _flatten_text(_content(block))
    return "algorithm" in block_type or bool(re.match(r"^\s*algorithm\s+\d+", text, flags=re.I))


def _is_visual_block(block: Dict[str, Any]) -> bool:
    block_type = _block_type(block)
    return (
        any(token in block_type for token in ("image", "figure", "table", "chart"))
        or _is_algorithm_block(block)
    )


def _visual_caption(block: Dict[str, Any]) -> str:
    content = _content(block)
    if isinstance(content, dict):
        for key in (
            "image_caption",
            "table_caption",
            "chart_caption",
            "algorithm_caption",
            "code_caption",
            "caption",
        ):
            text = _flatten_text(content.get(key))
            if text:
                return text
    return _caption_text(block)


def _visual_body(block: Dict[str, Any]) -> str:
    content = _content(block)
    if isinstance(content, dict):
        for key in (
            "algorithm_content",
            "table_body",
            "html",
            "content",
            "code_content",
            "table",
            "text",
        ):
            text = _flatten_text(content.get(key))
            if text:
                return text
    return _first_text(block, ("table_body", "table", "html", "md", "content", "text"))


def _label_number(text: str) -> Optional[str]:
    match = re.search(r"\b(?:figure|fig\.|table|algorithm)\s*([0-9]+)", text, flags=re.I)
    return match.group(1) if match else None


def _caption_text(block: Dict[str, Any]) -> str:
    value = block.get("caption") or block.get("captions")
    if isinstance(value, str):
        return value.strip()
    if isinstance(value, list):
        parts = []
        for item in value:
            if isinstance(item, str):
                parts.append(item)
            elif isinstance(item, dict):
                parts.append(_first_text(item, ("text", "content", "md")))
        return " ".join(x.strip() for x in parts if x and x.strip())
    return ""


def _page_number(block: Dict[str, Any]) -> Optional[int]:
    for key in ("page_idx", "page", "page_id"):
        value = block.get(key)
        if isinstance(value, int):
            return value + 1 if key == "page_idx" else value
        if isinstance(value, str) and value.isdigit():
            parsed = int(value)
            return parsed + 1 if key == "page_idx" else parsed
    return None


def _resolve_image_path(block: Dict[str, Any], output_dir: Path) -> Optional[str]:
    content = _content(block)
    if isinstance(content, dict):
        image_source = content.get("image_source")
        if isinstance(image_source, dict):
            path = _candidate_path(image_source.get("path"), output_dir)
            if path:
                return path
    for key in ("img_path", "image_path", "path"):
        path = _candidate_path(block.get(key), output_dir)
        if path:
            return path
    return None


def _candidate_path(value: Any, output_dir: Path) -> Optional[str]:
    if not isinstance(value, str) or not value.strip():
        return None
    raw = value.strip()
    path = Path(raw)
    candidates = [path] if path.is_absolute() else [output_dir / path, output_dir / Path(raw).name]
    for candidate in candidates:
        if candidate.exists():
            return str(candidate)
    return None
