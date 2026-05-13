import hashlib
import json

from src.config import settings
from src.infra.redis.redis_client import get_redis_client


class RagCache:
    def _key(self, agent_id: str, query: str) -> str:
        h = hashlib.sha256(query.strip().lower().encode()).hexdigest()[:16]
        return f"rag_cache:{agent_id}:{h}"

    def _agent_pattern(self, agent_id: str) -> str:
        return f"rag_cache:{agent_id}:*"

    async def get(self, agent_id: str, query: str) -> dict | None:
        client = await get_redis_client()
        raw = await client.get(self._key(agent_id, query))
        return json.loads(raw) if raw else None

    async def set(self, agent_id: str, query: str, value: dict) -> None:
        client = await get_redis_client()
        await client.set(
            self._key(agent_id, query),
            json.dumps(value, default=str),
            ex=settings.rag_cache_ttl_seconds,
        )

    async def invalidate_agent_cache(self, agent_id: str) -> None:
        client = await get_redis_client()
        pattern = self._agent_pattern(agent_id)
        keys = [key async for key in client.scan_iter(pattern)]
        if keys:
            await client.delete(*keys)
