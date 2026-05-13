import json
import logging
from typing import Any

from langchain_core.messages import HumanMessage, AIMessage
from langchain_core.prompts import ChatPromptTemplate
from langchain_core.output_parsers import StrOutputParser

from src.config import settings
from src.infra.redis.redis_client import get_redis_client

logger = logging.getLogger(__name__)

_SUMMARIZE_PROMPT = ChatPromptTemplate.from_messages([
    (
        "system",
        "You are summarizing a customer support conversation. "
        "Extract the key facts in 3-5 bullet points: user identity info, "
        "issues raised, data provided (order numbers, dates, etc.), and "
        "decisions or solutions already given. Be concise and factual.",
    ),
    ("human", "{conversation}"),
])


class ConversationMemory:
    def __init__(self, llm: Any = None) -> None:
        self._llm = llm
        self._summarize_chain = (_SUMMARIZE_PROMPT | llm | StrOutputParser()) if llm else None

    def _key(self, conversation_id: str) -> str:
        return f"conv_memory:{conversation_id}"

    async def load(self, conversation_id: str) -> list[dict]:
        client = await get_redis_client()
        raw = await client.get(self._key(conversation_id))
        return json.loads(raw) if raw else []

    async def save(self, conversation_id: str, user_query: str, assistant_answer: str) -> None:
        client = await get_redis_client()
        history = await self.load(conversation_id)
        history.append({"role": "user", "content": user_query})
        history.append({"role": "assistant", "content": assistant_answer})

        threshold = settings.memory_summarize_after_turns * 2
        if len(history) >= threshold and self._summarize_chain is not None:
            history = await self._compress(history)
        else:
            history = history[-40:]

        await client.set(
            self._key(conversation_id),
            json.dumps(history),
            ex=settings.conversation_memory_ttl_seconds,
        )

    async def _compress(self, history: list[dict]) -> list[dict]:
        n_to_summarize = settings.memory_turns_to_summarize * 2
        old_messages = history[:n_to_summarize]
        recent_messages = history[n_to_summarize:]

        conversation_text = "\n".join(
            f"{m['role'].upper()}: {m['content']}" for m in old_messages
        )

        try:
            summary = await self._summarize_chain.ainvoke({"conversation": conversation_text})
            logger.info("Conversation memory compressed (%d messages → 1 summary)", n_to_summarize)
            return [{"role": "system", "content": f"[Summary of earlier conversation]\n{summary}"}] + recent_messages
        except Exception:
            logger.exception("Summarization failed — falling back to sliding window")
            return history[-40:]
