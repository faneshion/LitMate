from __future__ import annotations

import json
import re
from typing import Any, Dict, List, Optional

import httpx

from .config import settings


class LLMClient:
    """OpenAI-compatible chat client for local LLM services."""

    def __init__(self) -> None:
        self.api_base = settings.openai_api_base.rstrip("/")
        self.api_key = settings.openai_api_key
        self.model = settings.openai_model

    async def chat(self, messages: List[Dict[str, str]], temperature: Optional[float] = None, max_tokens: Optional[int] = None) -> str:
        payload = {
            "model": self.model,
            "messages": messages,
            "temperature": settings.llm_temperature if temperature is None else temperature,
            "max_tokens": settings.llm_max_tokens if max_tokens is None else max_tokens,
            "top_p": settings.llm_top_p,
            "presence_penalty": settings.llm_presence_penalty,
            "stream": settings.llm_stream,
            "top_k": settings.llm_top_k,
            "chat_template_kwargs": {"enable_thinking": settings.llm_enable_thinking},
        }
        headers = {"Authorization": f"Bearer {self.api_key}", "Content-Type": "application/json"}
        url = f"{self.api_base}/chat/completions"
        async with httpx.AsyncClient(timeout=settings.llm_timeout_seconds) as client:
            if settings.llm_stream:
                chunks: List[str] = []
                async with client.stream("POST", url, json=payload, headers=headers) as response:
                    if response.is_error:
                        detail_bytes = await response.aread()
                        detail = detail_bytes.decode(response.encoding or "utf-8", errors="replace")[:1200]
                        raise httpx.HTTPStatusError(
                            f"LLM error {response.status_code}: {detail}",
                            request=response.request,
                            response=response,
                        )
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
                return "".join(chunks)
            response = await client.post(url, json=payload, headers=headers)
            if response.is_error:
                detail = response.text[:1200]
                raise httpx.HTTPStatusError(
                    f"LLM error {response.status_code}: {detail}",
                    request=response.request,
                    response=response,
                )
            response.raise_for_status()
            data = response.json()
            return data["choices"][0]["message"]["content"]

    async def extract_json(self, messages: List[Dict[str, str]], max_tokens: Optional[int] = None) -> Dict[str, Any]:
        text = await self.chat(messages, max_tokens=max_tokens)
        return parse_json_from_text(text)


def parse_json_from_text(text: str) -> Dict[str, Any]:
    text = text.strip()
    if text.startswith("```"):
        text = re.sub(r"^```(?:json)?", "", text, flags=re.I).strip()
        text = re.sub(r"```$", "", text).strip()
    try:
        return json.loads(text)
    except json.JSONDecodeError:
        pass
    match = re.search(r"\{.*\}", text, flags=re.S)
    if match:
        try:
            return json.loads(match.group(0))
        except json.JSONDecodeError:
            pass
    raise ValueError(f"LLM 没有返回可解析 JSON。原始输出前 800 字：{text[:800]}")
