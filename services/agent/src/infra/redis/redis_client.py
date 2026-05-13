import redis.asyncio as aioredis

from src.config import settings

_client: aioredis.Redis | None = None


async def get_redis_client() -> aioredis.Redis:
    global _client
    if _client is None:
        _client = await aioredis.from_url(
            settings.redis_url,
            encoding="utf-8",
            decode_responses=True,
        )
    return _client
