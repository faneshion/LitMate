from __future__ import annotations

import shutil
import json
import time
from pathlib import Path
from typing import Any, Dict, List, Optional

import httpx
from fastapi import FastAPI, File, Form, HTTPException, Query, UploadFile
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse, JSONResponse
from fastapi.staticfiles import StaticFiles
from pydantic import BaseModel

from .analysis_service import build_compare_report, build_evidence_graph, build_gap_summary, search_materials
from .bootstrap import default_experience_template
from .config import settings
from .document_parser import parse_document
from .extractor import ExperienceExtractor
from .feedback_service import build_feedback_summary, review_label_for_action
from .jsonl_store import JSONLStore
from .mineru_parser import mineru_runtime_status
from .models import (
    ArxivImportRequest,
    BibTeXImportRequest,
    CompareReport,
    DOIImportRequest,
    ExtractionRun,
    ExtractionTemplate,
    ImportSource,
    ManualPaperRequest,
    MaterialItem,
    Paper,
    PaperSet,
    PaperSetRequest,
    ReviewRecord,
    ReviewStatus,
    ReviewUpdateRequest,
    RunExtractionRequest,
    SearchMaterialsResponse,
    UserNote,
    now_iso,
)
from .source_importers import fetch_arxiv_metadata, import_arxiv, import_bibtex, import_doi, safe_filename

app = FastAPI(title=settings.app_name, version="0.2.0")
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

paper_store = JSONLStore(settings.data_dir / "papers.jsonl", Paper)
paper_set_store = JSONLStore(settings.data_dir / "paper_sets.jsonl", PaperSet)
template_store = JSONLStore(settings.data_dir / "templates.jsonl", ExtractionTemplate)
run_store = JSONLStore(settings.data_dir / "extraction_runs.jsonl", ExtractionRun)
material_store = JSONLStore(settings.data_dir / "materials.jsonl", MaterialItem)
note_store = JSONLStore(settings.data_dir / "notes.jsonl", UserNote)
review_store = JSONLStore(settings.data_dir / "review_records.jsonl", ReviewRecord)


class PaperParsingConfig(BaseModel):
    provider: str = "auto"
    mineru_enabled: bool = True
    mineru_command: str = "mineru"
    mineru_backend: str = "pipeline"
    mineru_timeout_seconds: int = 900
    mineru_online_enabled: bool = False
    mineru_online_base_url: str = "https://mineru.net"
    mineru_online_token: Optional[str] = None
    mineru_online_model_version: str = "vlm"
    mineru_online_language: str = "en"
    mineru_online_timeout_seconds: int = 900
    mineru_online_poll_interval_seconds: float = 6.0


class ExperienceConfig(BaseModel):
    extraction_top_k_chunks: int = 8
    max_chunk_chars: int = 3200
    chunk_overlap_chars: int = 400


class LLMConfig(BaseModel):
    openai_api_key: str = "EMPTY"
    openai_api_base: str
    openai_model: str
    llm_temperature: float = 0.7
    llm_timeout_seconds: int = 120
    llm_max_tokens: int = 8192
    llm_top_p: float = 0.8
    llm_presence_penalty: float = 1.5
    llm_top_k: int = 20
    llm_enable_thinking: bool = False
    llm_stream: bool = True


class LLMProfileConfig(LLMConfig):
    id: str = "default"
    name: str = "默认大模型"
    active: bool = False


class AppConfigPayload(BaseModel):
    paper_parsing: PaperParsingConfig
    experience: ExperienceConfig
    llm: LLMConfig
    llm_profiles: List[LLMProfileConfig] = []
    active_llm_profile_id: str = "default"


class LLMTestRequest(BaseModel):
    profile: LLMProfileConfig
    prompt: str = "请用一句话回答：连接测试是否成功？"
    max_tokens: Optional[int] = None


def bootstrap() -> None:
    if not template_store.get("tmpl_experience_v2"):
        template_store.append(default_experience_template())


bootstrap()


@app.get("/api/health")
def health() -> dict:
    return {
        "ok": True,
        "app": settings.app_name,
        "model": settings.openai_model,
        "api_base": settings.openai_api_base,
        "mineru": mineru_runtime_status(),
    }


def current_llm_config() -> LLMConfig:
    return LLMConfig(
        openai_api_key=settings.openai_api_key,
        openai_api_base=settings.openai_api_base,
        openai_model=settings.openai_model,
        llm_temperature=settings.llm_temperature,
        llm_timeout_seconds=settings.llm_timeout_seconds,
        llm_max_tokens=settings.llm_max_tokens,
        llm_top_p=settings.llm_top_p,
        llm_presence_penalty=settings.llm_presence_penalty,
        llm_top_k=settings.llm_top_k,
        llm_enable_thinking=settings.llm_enable_thinking,
        llm_stream=settings.llm_stream,
    )


def load_llm_profiles() -> List[LLMProfileConfig]:
    active_id = settings.active_llm_profile_id or "default"
    profiles: List[LLMProfileConfig] = []
    if settings.llm_profiles_json:
        try:
            raw_profiles = json.loads(settings.llm_profiles_json)
            if isinstance(raw_profiles, list):
                profiles = [LLMProfileConfig(**item) for item in raw_profiles if isinstance(item, dict)]
        except Exception:
            profiles = []
    if not profiles:
        profiles = [
            LLMProfileConfig(
                id=active_id,
                name="当前配置",
                active=True,
                **current_llm_config().model_dump(),
            )
        ]
    if not any(profile.id == active_id for profile in profiles):
        active_id = profiles[0].id
    for profile in profiles:
        profile.active = profile.id == active_id
    return profiles


def active_llm_profile(profiles: List[LLMProfileConfig], active_id: str) -> LLMProfileConfig:
    return next((profile for profile in profiles if profile.id == active_id), profiles[0])


@app.get("/api/config", response_model=AppConfigPayload)
def get_app_config() -> AppConfigPayload:
    profiles = load_llm_profiles()
    active_id = settings.active_llm_profile_id or profiles[0].id
    active_profile = active_llm_profile(profiles, active_id)
    return AppConfigPayload(
        paper_parsing=PaperParsingConfig(
            provider=settings.paper_parser_provider,
            mineru_enabled=settings.mineru_enabled,
            mineru_command=settings.mineru_command,
            mineru_backend=settings.mineru_backend,
            mineru_timeout_seconds=settings.mineru_timeout_seconds,
            mineru_online_enabled=settings.mineru_online_enabled,
            mineru_online_base_url=settings.mineru_online_base_url,
            mineru_online_token="",
            mineru_online_model_version=settings.mineru_online_model_version,
            mineru_online_language=settings.mineru_online_language,
            mineru_online_timeout_seconds=settings.mineru_online_timeout_seconds,
            mineru_online_poll_interval_seconds=settings.mineru_online_poll_interval_seconds,
        ),
        experience=ExperienceConfig(
            extraction_top_k_chunks=settings.extraction_top_k_chunks,
            max_chunk_chars=settings.max_chunk_chars,
            chunk_overlap_chars=settings.chunk_overlap_chars,
        ),
        llm=LLMConfig(**active_profile.model_dump(exclude={"id", "name", "active"})),
        llm_profiles=profiles,
        active_llm_profile_id=active_profile.id,
    )


@app.post("/api/config", response_model=AppConfigPayload)
def update_app_config(payload: AppConfigPayload) -> AppConfigPayload:
    if payload.paper_parsing.provider not in {"auto", "online_mineru", "local_mineru", "pypdf"}:
        raise HTTPException(status_code=400, detail="论文解析方式必须是 auto / online_mineru / local_mineru / pypdf")
    profiles = payload.llm_profiles or [
        LLMProfileConfig(
            id=payload.active_llm_profile_id or "default",
            name="当前配置",
            active=True,
            **payload.llm.model_dump(),
        )
    ]
    if not profiles:
        raise HTTPException(status_code=400, detail="至少需要保留一组大模型配置")
    seen_profile_ids = set()
    for profile in profiles:
        profile.id = profile.id.strip() or profile.name.strip() or "default"
        profile.name = profile.name.strip() or profile.id
        if profile.id in seen_profile_ids:
            raise HTTPException(status_code=400, detail=f"大模型配置 ID 重复：{profile.id}")
        seen_profile_ids.add(profile.id)
        if not profile.openai_api_base.strip():
            raise HTTPException(status_code=400, detail=f"大模型配置 {profile.name} 缺少 API Base")
        if not profile.openai_model.strip():
            raise HTTPException(status_code=400, detail=f"大模型配置 {profile.name} 缺少模型名称")
    active_id = payload.active_llm_profile_id or next((p.id for p in profiles if p.active), profiles[0].id)
    if active_id not in seen_profile_ids:
        active_id = profiles[0].id
    for profile in profiles:
        profile.active = profile.id == active_id
    active_profile = active_llm_profile(profiles, active_id)
    updates: Dict[str, Any] = {
        "PAPER_PARSER_PROVIDER": payload.paper_parsing.provider,
        "MINERU_ENABLED": payload.paper_parsing.mineru_enabled,
        "MINERU_COMMAND": payload.paper_parsing.mineru_command,
        "MINERU_BACKEND": payload.paper_parsing.mineru_backend,
        "MINERU_TIMEOUT_SECONDS": payload.paper_parsing.mineru_timeout_seconds,
        "MINERU_ONLINE_ENABLED": payload.paper_parsing.mineru_online_enabled,
        "MINERU_ONLINE_BASE_URL": payload.paper_parsing.mineru_online_base_url,
        "MINERU_ONLINE_MODEL_VERSION": payload.paper_parsing.mineru_online_model_version,
        "MINERU_ONLINE_LANGUAGE": payload.paper_parsing.mineru_online_language,
        "MINERU_ONLINE_TIMEOUT_SECONDS": payload.paper_parsing.mineru_online_timeout_seconds,
        "MINERU_ONLINE_POLL_INTERVAL_SECONDS": payload.paper_parsing.mineru_online_poll_interval_seconds,
        "EXTRACTION_TOP_K_CHUNKS": payload.experience.extraction_top_k_chunks,
        "MAX_CHUNK_CHARS": payload.experience.max_chunk_chars,
        "CHUNK_OVERLAP_CHARS": payload.experience.chunk_overlap_chars,
        "OPENAI_API_KEY": active_profile.openai_api_key,
        "OPENAI_API_BASE": active_profile.openai_api_base,
        "OPENAI_MODEL": active_profile.openai_model,
        "LLM_TEMPERATURE": active_profile.llm_temperature,
        "LLM_TIMEOUT_SECONDS": active_profile.llm_timeout_seconds,
        "LLM_MAX_TOKENS": active_profile.llm_max_tokens,
        "LLM_TOP_P": active_profile.llm_top_p,
        "LLM_PRESENCE_PENALTY": active_profile.llm_presence_penalty,
        "LLM_TOP_K": active_profile.llm_top_k,
        "LLM_ENABLE_THINKING": active_profile.llm_enable_thinking,
        "LLM_STREAM": active_profile.llm_stream,
        "LLM_PROFILES_JSON": json.dumps([p.model_dump() for p in profiles], ensure_ascii=False, separators=(",", ":")),
        "ACTIVE_LLM_PROFILE_ID": active_profile.id,
    }
    if payload.paper_parsing.mineru_online_token:
        updates["MINERU_ONLINE_TOKEN"] = payload.paper_parsing.mineru_online_token
    save_env_values(updates)
    apply_runtime_config(updates)
    return get_app_config()


def apply_runtime_config(updates: Dict[str, Any]) -> None:
    alias_to_attr = {field.alias: name for name, field in settings.__class__.model_fields.items()}
    for alias, value in updates.items():
        attr = alias_to_attr.get(alias)
        if attr:
            setattr(settings, attr, value)


def save_env_values(updates: Dict[str, Any]) -> None:
    env_path = Path(".env")
    lines = env_path.read_text(encoding="utf-8").splitlines() if env_path.exists() else []
    rendered = {key: env_value(value) for key, value in updates.items()}
    seen = set()
    new_lines = []
    for line in lines:
        stripped = line.strip()
        if not stripped or stripped.startswith("#") or "=" not in line:
            new_lines.append(line)
            continue
        key = line.split("=", 1)[0].strip()
        if key in rendered:
            new_lines.append(f"{key}={rendered[key]}")
            seen.add(key)
        else:
            new_lines.append(line)
    for key, value in rendered.items():
        if key not in seen:
            new_lines.append(f"{key}={value}")
    env_path.write_text("\n".join(new_lines) + "\n", encoding="utf-8")


def env_value(value: Any) -> str:
    if isinstance(value, bool):
        return "true" if value else "false"
    if isinstance(value, (int, float)):
        return str(value)
    text = str(value)
    escaped = text.replace("\\", "\\\\").replace("'", "\\'")
    return f"'{escaped}'"


@app.post("/api/config/llm-test")
async def test_llm_config(req: LLMTestRequest) -> dict:
    profile = req.profile
    if not profile.openai_api_base.strip() or not profile.openai_model.strip():
        raise HTTPException(status_code=400, detail="请先填写 API Base 和模型名称")
    started = time.perf_counter()
    payload = {
        "model": profile.openai_model,
        "messages": [{"role": "user", "content": req.prompt.strip() or "请回复 OK。"}],
        "max_tokens": min(max(req.max_tokens or 512, 16), max(profile.llm_max_tokens, 512)),
        "temperature": profile.llm_temperature,
        "top_p": profile.llm_top_p,
        "presence_penalty": profile.llm_presence_penalty,
        "stream": profile.llm_stream,
        "top_k": profile.llm_top_k,
        "chat_template_kwargs": {"enable_thinking": profile.llm_enable_thinking},
    }
    headers = {
        "Authorization": f"Bearer {profile.openai_api_key or 'EMPTY'}",
        "Content-Type": "application/json",
    }
    url = f"{profile.openai_api_base.rstrip('/')}/chat/completions"

    async def response_error_detail(response: httpx.Response) -> str:
        try:
            await response.aread()
            return response.text[:1000]
        except Exception:
            return f"HTTP {response.status_code}"

    try:
        async with httpx.AsyncClient(timeout=profile.llm_timeout_seconds) as client:
            if profile.llm_stream:
                chunks: List[str] = []
                async with client.stream("POST", url, json=payload, headers=headers) as response:
                    if response.is_error:
                        detail_bytes = await response.aread()
                        detail = detail_bytes.decode(response.encoding or "utf-8", errors="replace")[:1000]
                        raise HTTPException(status_code=400, detail=f"大模型接口返回错误：{detail}")
                    response.raise_for_status()
                    async for line in response.aiter_lines():
                        if not line.startswith("data:"):
                            continue
                        raw = line.removeprefix("data:").strip()
                        if raw == "[DONE]":
                            break
                        try:
                            data = json.loads(raw)
                            content = data["choices"][0].get("delta", {}).get("content")
                        except Exception:
                            content = None
                        if content:
                            chunks.append(content)
                content = "".join(chunks).strip()
            else:
                response = await client.post(url, json=payload, headers=headers)
                response.raise_for_status()
                data = response.json()
                content = data["choices"][0]["message"]["content"].strip()
        return {
            "ok": True,
            "content": content,
            "elapsed_seconds": round(time.perf_counter() - started, 3),
        }
    except httpx.HTTPStatusError as exc:
        detail = await response_error_detail(exc.response) if exc.response is not None else str(exc)
        raise HTTPException(status_code=400, detail=f"大模型接口返回错误：{detail}") from exc
    except HTTPException:
        raise
    except Exception as exc:
        raise HTTPException(status_code=400, detail=f"大模型接口测试失败：{exc}") from exc


# ----------------------------- 1. 论文管理版块 -----------------------------
@app.post("/api/papers/upload", response_model=Paper)
async def upload_paper(file: UploadFile = File(...)) -> Paper:
    suffix = Path(file.filename or "paper.pdf").suffix.lower()
    if suffix not in {".pdf", ".txt", ".md"}:
        raise HTTPException(status_code=400, detail="仅支持 PDF / TXT / MD 上传。")
    out_path = settings.upload_dir / safe_filename(file.filename or "paper")
    with out_path.open("wb") as f:
        shutil.copyfileobj(file.file, f)
    paper = parse_document(out_path)
    paper.source = ImportSource.upload
    paper_store.append(paper)
    return paper


@app.post("/api/papers/import/arxiv", response_model=Paper)
def import_paper_from_arxiv(req: ArxivImportRequest) -> Paper:
    try:
        paper = import_arxiv(req.arxiv_id_or_url)
        paper_store.append(paper)
        return paper
    except Exception as exc:
        raise HTTPException(status_code=400, detail=str(exc)) from exc


@app.post("/api/papers/import/doi", response_model=Paper)
def import_paper_from_doi(req: DOIImportRequest) -> Paper:
    try:
        paper = import_doi(req.doi, req.try_download_pdf)
        paper_store.append(paper)
        return paper
    except Exception as exc:
        raise HTTPException(status_code=400, detail=str(exc)) from exc


@app.post("/api/papers/import/bibtex", response_model=Paper)
def import_paper_from_bibtex(req: BibTeXImportRequest) -> Paper:
    try:
        paper = import_bibtex(req.bibtex_text)
        paper_store.append(paper)
        return paper
    except Exception as exc:
        raise HTTPException(status_code=400, detail=str(exc)) from exc


@app.post("/api/papers/manual", response_model=Paper)
def create_manual_paper(req: ManualPaperRequest) -> Paper:
    paper = Paper(metadata=req.metadata, full_text=req.full_text, source=ImportSource.manual)
    if req.full_text:
        tmp_path = settings.upload_dir / f"{paper.id}.txt"
        tmp_path.write_text(req.full_text, encoding="utf-8")
        parsed = parse_document(tmp_path, paper_id=paper.id, metadata=req.metadata)
        parsed.source = ImportSource.manual
        paper = parsed
    paper_store.append(paper)
    return paper


@app.get("/api/papers", response_model=List[Paper])
def list_papers() -> List[Paper]:
    return sorted(paper_store.list(), key=lambda p: p.updated_at or p.created_at, reverse=True)


def _valid_unique_paper_ids(paper_ids: List[str]) -> List[str]:
    valid_ids = {paper.id for paper in paper_store.list()}
    cleaned: List[str] = []
    for paper_id in paper_ids:
        if paper_id in valid_ids and paper_id not in cleaned:
            cleaned.append(paper_id)
    return cleaned


@app.get("/api/paper-sets", response_model=List[PaperSet])
def list_paper_sets() -> List[PaperSet]:
    sets: List[PaperSet] = []
    for item in paper_set_store.list():
        cleaned_ids = _valid_unique_paper_ids(item.paper_ids)
        if cleaned_ids != item.paper_ids:
            item.paper_ids = cleaned_ids
            item.updated_at = now_iso()
            paper_set_store.upsert(item)
        sets.append(item)
    return sorted(sets, key=lambda item: item.updated_at or item.created_at, reverse=True)


@app.post("/api/paper-sets", response_model=PaperSet)
def create_paper_set(req: PaperSetRequest) -> PaperSet:
    name = req.name.strip()
    if not name:
        raise HTTPException(status_code=400, detail="论文集名称不能为空。")
    paper_set = PaperSet(
        name=name,
        detail=req.detail.strip(),
        paper_ids=_valid_unique_paper_ids(req.paper_ids),
    )
    paper_set_store.append(paper_set)
    return paper_set


@app.put("/api/paper-sets/{paper_set_id}", response_model=PaperSet)
def update_paper_set(paper_set_id: str, req: PaperSetRequest) -> PaperSet:
    paper_set = paper_set_store.get(paper_set_id)
    if not paper_set:
        raise HTTPException(status_code=404, detail="Paper set not found")
    name = req.name.strip()
    if not name:
        raise HTTPException(status_code=400, detail="论文集名称不能为空。")
    paper_set.name = name
    paper_set.detail = req.detail.strip()
    paper_set.paper_ids = _valid_unique_paper_ids(req.paper_ids)
    paper_set.updated_at = now_iso()
    paper_set_store.upsert(paper_set)
    return paper_set


@app.delete("/api/paper-sets/{paper_set_id}")
def delete_paper_set(paper_set_id: str) -> dict:
    if not paper_set_store.delete(paper_set_id):
        raise HTTPException(status_code=404, detail="Paper set not found")
    return {"ok": True, "deleted": paper_set_id}


@app.get("/api/papers/{paper_id}", response_model=Paper)
def get_paper(paper_id: str) -> Paper:
    paper = paper_store.get(paper_id)
    if not paper:
        raise HTTPException(status_code=404, detail="Paper not found")
    return paper


@app.get("/api/papers/{paper_id}/file")
def get_paper_file(paper_id: str):
    paper = get_paper(paper_id)
    if not paper.file_path or not Path(paper.file_path).exists():
        raise HTTPException(status_code=404, detail="没有可访问的原始文件。")
    return FileResponse(paper.file_path)


@app.get("/api/papers/{paper_id}/figures/{figure_id}/image")
def get_paper_figure_image(paper_id: str, figure_id: str):
    paper = get_paper(paper_id)
    figure = next((item for item in paper.figures if item.id == figure_id), None)
    if not figure or not figure.image_path:
        raise HTTPException(status_code=404, detail="没有可访问的图表图片。")
    image_path = Path(figure.image_path)
    if not image_path.exists():
        raise HTTPException(status_code=404, detail="图表图片不存在。")
    return FileResponse(image_path)


@app.post("/api/papers/{paper_id}/reparse", response_model=Paper)
def reparse_paper(paper_id: str) -> Paper:
    paper = get_paper(paper_id)
    if not paper.file_path or not Path(paper.file_path).exists():
        raise HTTPException(status_code=400, detail="该论文没有可重新解析的原始文件。")
    metadata = paper.metadata.model_copy(deep=True)
    if paper.source == ImportSource.arxiv and paper.metadata.arxiv_id:
        refreshed = fetch_arxiv_metadata(paper.metadata.arxiv_id)
        if refreshed:
            refreshed.extra = {**paper.metadata.extra, **refreshed.extra}
            metadata = refreshed
    metadata.extra = {k: v for k, v in metadata.extra.items() if k not in {"review_status", "verified_at"}}
    parse_started_at = time.perf_counter()
    parsed = parse_document(Path(paper.file_path), paper_id=paper.id, metadata=metadata)
    parsed.metadata.extra.pop("review_status", None)
    parsed.metadata.extra.pop("verified_at", None)
    duration = parsed.metadata.extra.get("parse_duration_seconds")
    if not isinstance(duration, (int, float)) or duration < 0:
        parsed.metadata.extra["parse_duration_seconds"] = round(time.perf_counter() - parse_started_at, 3)
    parsed.source = paper.source
    parsed.created_at = paper.created_at
    parsed.updated_at = now_iso()
    paper_store.upsert(parsed)
    return parsed


@app.post("/api/papers/{paper_id}/verify", response_model=Paper)
def verify_paper(paper_id: str) -> Paper:
    paper = get_paper(paper_id)
    paper.metadata.extra = {
        **paper.metadata.extra,
        "review_status": "verified",
        "verified_at": now_iso(),
    }
    paper_store.upsert(paper)
    return paper


@app.delete("/api/papers/{paper_id}")
def delete_paper(paper_id: str) -> dict:
    paper = paper_store.get(paper_id)
    if not paper:
        raise HTTPException(status_code=404, detail="Paper not found")
    paper_store.delete(paper_id)
    run_store.replace_all([r for r in run_store.list() if r.paper_id != paper_id])
    material_store.replace_all([m for m in material_store.list() if m.paper_id != paper_id])
    note_store.replace_all([n for n in note_store.list() if n.paper_id != paper_id])
    for paper_set in paper_set_store.list():
        if paper_id in paper_set.paper_ids:
            paper_set.paper_ids = [item for item in paper_set.paper_ids if item != paper_id]
            paper_set.updated_at = now_iso()
            paper_set_store.upsert(paper_set)
    _delete_paper_artifacts(paper)
    return {"ok": True, "deleted": paper_id}


def _delete_paper_artifacts(paper: Paper) -> None:
    allowed_roots = [
        settings.data_dir.resolve(),
        settings.upload_dir.resolve(),
        settings.figure_dir.resolve(),
        settings.mineru_output_dir.resolve(),
    ]
    paths = [
        Path(paper.text_path) if paper.text_path else None,
        Path(paper.file_path) if paper.file_path else None,
        settings.figure_dir / paper.id,
        settings.mineru_output_dir / paper.id,
    ]
    for path in paths:
        if not path:
            continue
        try:
            resolved = path.resolve()
        except Exception:
            continue
        if not any(resolved == root or root in resolved.parents for root in allowed_roots):
            continue
        if resolved.is_dir():
            shutil.rmtree(resolved, ignore_errors=True)
        elif resolved.exists():
            resolved.unlink(missing_ok=True)


# ----------------------------- 2. 科研对象抽取版块 -----------------------------
@app.get("/api/templates", response_model=List[ExtractionTemplate])
def list_templates() -> List[ExtractionTemplate]:
    return template_store.list()


@app.post("/api/templates", response_model=ExtractionTemplate)
def create_template(template: ExtractionTemplate) -> ExtractionTemplate:
    if template.prompt_profiles:
        active = next((p for p in template.prompt_profiles if p.id == template.active_prompt_id), template.prompt_profiles[0])
        template.active_prompt_id = active.id
        template.system_prompt = active.content or template.system_prompt
    template.updated_at = now_iso()
    template_store.upsert(template)
    return template


@app.get("/api/templates/{template_id}", response_model=ExtractionTemplate)
def get_template(template_id: str) -> ExtractionTemplate:
    tmpl = template_store.get(template_id)
    if not tmpl:
        raise HTTPException(status_code=404, detail="Template not found")
    return tmpl


@app.post("/api/extractions/run", response_model=ExtractionRun)
async def run_extraction(req: RunExtractionRequest) -> ExtractionRun:
    paper = paper_store.get(req.paper_id)
    if not paper:
        raise HTTPException(status_code=404, detail="Paper not found")
    template = template_store.get(req.template_id)
    if not template:
        raise HTTPException(status_code=404, detail="Template not found")
    if not paper.chunks:
        raise HTTPException(status_code=400, detail="该论文没有可抽取正文。请上传 PDF/TXT 或使用 arXiv 导入。")
    extractor = ExperienceExtractor()
    run = await extractor.run(paper, template, req.dimension_names)
    run_store.append(run)
    sync_materials_for_run(run)
    return run


@app.get("/api/extractions", response_model=List[ExtractionRun])
def list_extractions(paper_id: Optional[str] = None) -> List[ExtractionRun]:
    runs = run_store.list()
    if paper_id:
        runs = [r for r in runs if r.paper_id == paper_id]
    return sorted(runs, key=lambda r: r.created_at, reverse=True)


@app.get("/api/extractions/{run_id}", response_model=ExtractionRun)
def get_extraction(run_id: str) -> ExtractionRun:
    run = run_store.get(run_id)
    if not run:
        raise HTTPException(status_code=404, detail="Extraction run not found")
    return run


# ----------------------------- 3. 人机协同审查版块 -----------------------------
@app.put("/api/extractions/{run_id}/items/{item_id}/review", response_model=ExtractionRun)
def review_item(run_id: str, item_id: str, req: ReviewUpdateRequest) -> ExtractionRun:
    run = run_store.get(run_id)
    if not run:
        raise HTTPException(status_code=404, detail="Extraction run not found")
    template = template_store.get(run.template_id)
    prompt = None
    if template:
        prompt = next((p for p in template.prompt_profiles if p.id == template.active_prompt_id), None)
        if not prompt and template.prompt_profiles:
            prompt = template.prompt_profiles[0]
    found = False
    for item in run.items:
        if item.id == item_id:
            old_title = item.edited_title or item.title
            old_answer = item.edited_content or item.content
            item.review_status = req.status
            item.edited_title = req.edited_title
            item.edited_content = req.edited_content
            item.user_note = req.user_note
            item.tags = req.tags
            item.review_root_cause = req.root_cause
            item.review_suggested_target = req.suggested_target
            item.updated_at = now_iso()
            prompt_id = prompt.id if prompt else ((template.active_prompt_id or "") if template else "")
            review_store.append(ReviewRecord(
                paper_id=run.paper_id,
                profile_id=template.id if template else run.template_id,
                profile_version=template.version if template else "",
                dimension_id=item.dimension_name,
                dimension_name=item.dimension_label,
                extraction_id=run.id,
                result_id=item.id,
                prompt_id=prompt_id,
                prompt_version=prompt.version if prompt else "",
                model_name=run.model,
                review_action=req.status,
                review_label=review_label_for_action(req.status),
                review_comment=req.user_note,
                reviewer_edit={
                    "old_title": old_title,
                    "new_title": req.edited_title or old_title,
                    "old_answer": old_answer,
                    "new_answer": req.edited_content or old_answer,
                },
                error_tags=req.tags,
                root_cause=req.root_cause,
                suggested_target=req.suggested_target,
            ))
            found = True
            break
    if not found:
        raise HTTPException(status_code=404, detail="Item not found")
    run.updated_at = now_iso()
    run_store.upsert(run)
    sync_materials_for_run(run, reviewed_item_id=item_id)
    return run


@app.get("/api/reviews", response_model=List[ReviewRecord])
def list_review_records(
    paper_id: Optional[str] = None,
    profile_id: Optional[str] = None,
    dimension_id: Optional[str] = None,
    result_id: Optional[str] = None,
    prompt_id: Optional[str] = None,
) -> List[ReviewRecord]:
    records = review_store.list()
    if paper_id:
        records = [r for r in records if r.paper_id == paper_id]
    if profile_id:
        records = [r for r in records if r.profile_id == profile_id]
    if dimension_id:
        records = [r for r in records if r.dimension_id == dimension_id]
    if result_id:
        records = [r for r in records if r.result_id == result_id]
    if prompt_id:
        records = [r for r in records if r.prompt_id == prompt_id]
    return sorted(records, key=lambda item: item.created_at, reverse=True)


@app.get("/api/feedback/dimensions")
def dimension_feedback(profile_id: Optional[str] = None, dimension_id: Optional[str] = None) -> Dict[str, Any]:
    return build_feedback_summary(review_store.list(), template_store.list(), profile_id=profile_id, dimension_id=dimension_id)


@app.get("/api/feedback/template-upgrades")
def template_upgrade_candidates(profile_id: Optional[str] = None) -> Dict[str, Any]:
    summary = build_feedback_summary(review_store.list(), template_store.list(), profile_id=profile_id)
    return {
        "total_reviews": summary["total_reviews"],
        "upgrade_candidates": summary["upgrade_candidates"],
    }


@app.post("/api/notes", response_model=UserNote)
def create_note(note: UserNote) -> UserNote:
    note.updated_at = now_iso()
    note_store.append(note)
    return note


@app.get("/api/notes", response_model=List[UserNote])
def list_notes(paper_id: Optional[str] = None, item_id: Optional[str] = None) -> List[UserNote]:
    notes = note_store.list()
    if paper_id:
        notes = [n for n in notes if n.paper_id == paper_id]
    if item_id:
        notes = [n for n in notes if n.item_id == item_id]
    return sorted(notes, key=lambda n: n.created_at, reverse=True)


# ----------------------------- 4. 素材管理与分析版块 -----------------------------
@app.get("/api/materials", response_model=List[MaterialItem])
def list_materials() -> List[MaterialItem]:
    return sorted(material_store.list(), key=lambda m: m.updated_at, reverse=True)


@app.get("/api/materials/search", response_model=SearchMaterialsResponse)
def api_search_materials(
    q: str = "",
    paper_id: Optional[str] = None,
    dimension_name: Optional[str] = None,
    status: Optional[ReviewStatus] = None,
) -> SearchMaterialsResponse:
    items = search_materials(material_store.list(), query=q, paper_id=paper_id, dimension_name=dimension_name, status=status)
    return SearchMaterialsResponse(query=q, total=len(items), items=items)


@app.get("/api/analysis/compare", response_model=CompareReport)
def compare_papers(
    paper_ids: str = Query(..., description="逗号分隔的 paper_id"),
    template_id: Optional[str] = None,
    include_pending: bool = True,
) -> CompareReport:
    ids = [x.strip() for x in paper_ids.split(",") if x.strip()]
    papers = [p for p in paper_store.list() if p.id in ids]
    if not papers:
        raise HTTPException(status_code=404, detail="没有找到待对比论文。")
    runs = [r for r in run_store.list() if r.paper_id in ids and (not template_id or r.template_id == template_id)]
    template = template_store.get(template_id) if template_id else None
    return build_compare_report(papers, runs, template, include_pending)


@app.get("/api/analysis/gaps")
def gap_analysis(template_id: str = "tmpl_experience_v2") -> dict:
    template = get_template(template_id)
    return build_gap_summary(paper_store.list(), run_store.list(), template)


@app.get("/api/analysis/evidence-graph")
def evidence_graph() -> dict:
    return build_evidence_graph(material_store.list(), paper_store.list())


@app.get("/api/export/run/{run_id}")
def export_run(run_id: str):
    run = get_extraction(run_id)
    return JSONResponse(run.model_dump(mode="json"))


@app.get("/api/export/paper/{paper_id}")
def export_paper(paper_id: str):
    paper = get_paper(paper_id)
    return JSONResponse(
        paper.model_dump(mode="json"),
        headers={"Content-Disposition": f'attachment; filename="{safe_filename(paper.id)}.json"'},
    )


@app.get("/api/export/all")
def export_all() -> dict:
    return {
        "papers": [p.model_dump(mode="json") for p in paper_store.list()],
        "templates": [t.model_dump(mode="json") for t in template_store.list()],
        "extraction_runs": [r.model_dump(mode="json") for r in run_store.list()],
        "materials": [m.model_dump(mode="json") for m in material_store.list()],
        "notes": [n.model_dump(mode="json") for n in note_store.list()],
        "review_records": [r.model_dump(mode="json") for r in review_store.list()],
    }


def sync_materials_for_run(run: ExtractionRun, reviewed_item_id: Optional[str] = None) -> None:
    existing = material_store.list()
    existing_by_item_id = {m.extraction_item_id: m for m in existing}
    for item in run.items:
        item_tags = list(dict.fromkeys(item.tags))
        mat = existing_by_item_id.get(item.id)
        if mat:
            mat.title = item.edited_title or item.title
            mat.content = item.edited_content or item.content
            mat.evidence = item.evidence
            mat.review_status = item.review_status
            mat.user_note = item.user_note
            if reviewed_item_id is None or item.id == reviewed_item_id:
                mat.tags = item_tags
            mat.updated_at = now_iso()
        else:
            mat = MaterialItem(
                paper_id=run.paper_id,
                extraction_run_id=run.id,
                extraction_item_id=item.id,
                dimension_name=item.dimension_name,
                dimension_label=item.dimension_label,
                title=item.edited_title or item.title,
                content=item.edited_content or item.content,
                evidence=item.evidence,
                review_status=item.review_status,
                tags=item_tags,
                user_note=item.user_note,
            )
        material_store.upsert(mat)


static_dir = Path(__file__).resolve().parent.parent / "static"
app.mount("/", StaticFiles(directory=static_dir, html=True), name="static")
