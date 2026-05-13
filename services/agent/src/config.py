from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=".env", extra="ignore")

    grpc_port: int = 50053
    http_port: int = 8000
    mongodb_url: str = "mongodb://admin:admin@localhost:27017"
    mongodb_db: str = "agent_db"
    redis_url: str = "redis://localhost:6379"
    openai_api_key: str = ""
    openai_embedding_model: str = "text-embedding-3-small"
    openai_chat_model: str = "gpt-4o-mini"
    rag_cache_ttl_seconds: int = 300
    conversation_memory_ttl_seconds: int = 3600
    use_local_vector_search: bool = True
    memory_summarize_after_turns: int = 20
    memory_turns_to_summarize: int = 10


settings = Settings()
