from pathlib import Path
from pydantic import Field
from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    app_name: str = "Literature Research Assistant V2"
    app_host: str = "0.0.0.0"
    app_port: int = 7860

    openai_api_key: str = Field(default="EMPTY", alias="OPENAI_API_KEY")
    openai_api_base: str = Field(default="http://localhost:8000/v1", alias="OPENAI_API_BASE")
    openai_model: str = Field(default="local-model", alias="OPENAI_MODEL")
    llm_temperature: float = Field(default=0.1, alias="LLM_TEMPERATURE")
    llm_timeout_seconds: int = Field(default=120, alias="LLM_TIMEOUT_SECONDS")
    llm_max_tokens: int = Field(default=4096, alias="LLM_MAX_TOKENS")
    llm_top_p: float = Field(default=0.8, alias="LLM_TOP_P")
    llm_presence_penalty: float = Field(default=0.0, alias="LLM_PRESENCE_PENALTY")
    llm_top_k: int = Field(default=20, alias="LLM_TOP_K")
    llm_enable_thinking: bool = Field(default=False, alias="LLM_ENABLE_THINKING")
    llm_stream: bool = Field(default=False, alias="LLM_STREAM")
    llm_profiles_json: str = Field(default="", alias="LLM_PROFILES_JSON")
    active_llm_profile_id: str = Field(default="default", alias="ACTIVE_LLM_PROFILE_ID")

    data_dir: Path = Field(default=Path("data"), alias="DATA_DIR")
    upload_dir: Path = Field(default=Path("data/uploads"), alias="UPLOAD_DIR")
    figure_dir: Path = Field(default=Path("data/figures"), alias="FIGURE_DIR")
    mineru_output_dir: Path = Field(default=Path("data/mineru"), alias="MINERU_OUTPUT_DIR")
    paper_parser_provider: str = Field(default="auto", alias="PAPER_PARSER_PROVIDER")
    mineru_enabled: bool = Field(default=True, alias="MINERU_ENABLED")
    mineru_command: str = Field(default="mineru", alias="MINERU_COMMAND")
    mineru_backend: str = Field(default="pipeline", alias="MINERU_BACKEND")
    mineru_timeout_seconds: int = Field(default=900, alias="MINERU_TIMEOUT_SECONDS")
    mineru_online_enabled: bool = Field(default=False, alias="MINERU_ONLINE_ENABLED")
    mineru_online_token: str = Field(default="", alias="MINERU_ONLINE_TOKEN")
    mineru_online_base_url: str = Field(default="https://mineru.net", alias="MINERU_ONLINE_BASE_URL")
    mineru_online_model_version: str = Field(default="vlm", alias="MINERU_ONLINE_MODEL_VERSION")
    mineru_online_language: str = Field(default="en", alias="MINERU_ONLINE_LANGUAGE")
    mineru_online_timeout_seconds: int = Field(default=900, alias="MINERU_ONLINE_TIMEOUT_SECONDS")
    mineru_online_poll_interval_seconds: float = Field(default=6.0, alias="MINERU_ONLINE_POLL_INTERVAL_SECONDS")

    max_chunk_chars: int = Field(default=3200, alias="MAX_CHUNK_CHARS")
    chunk_overlap_chars: int = Field(default=400, alias="CHUNK_OVERLAP_CHARS")
    extraction_top_k_chunks: int = Field(default=8, alias="EXTRACTION_TOP_K_CHUNKS")

    class Config:
        env_file = ".env"
        populate_by_name = True


settings = Settings()
settings.data_dir.mkdir(parents=True, exist_ok=True)
settings.upload_dir.mkdir(parents=True, exist_ok=True)
settings.figure_dir.mkdir(parents=True, exist_ok=True)
settings.mineru_output_dir.mkdir(parents=True, exist_ok=True)
