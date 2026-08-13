"""Fakes offline para o modo dev (USE_STUB_LLM=true).

Permitem que o fluxo QueryAgent rode sem OpenAI, sem embeddings e sem Redis —
apenas o repositório de agents (Mongo) é real. Cada fake respeita a interface
usada pelo QueryAgentUseCase.
"""

from src.application.ports.output.llm_gateway import ILlmGateway
from src.application.ports.output.vector_store import IVectorStore
from src.domain.entities.document import Document
from src.domain.entities.rag_chunk import RagChunk


class FakeLlmGateway(ILlmGateway):
    async def generate(
        self,
        system_prompt: str,
        user_query: str,
        context_chunks: list[str],
        conversation_history: list[dict],
    ) -> str:
        return (
            f'Assistente (modo dev): recebi "{user_query}". '
            "Configure OPENAI_API_KEY e USE_STUB_LLM=false para respostas reais."
        )


class FakeVectorStore(IVectorStore):
    async def add_documents(
        self, agent_id: str, documents: list[Document]
    ) -> list[str]:
        return []

    async def similarity_search(
        self, agent_id: str, query: str, top_k: int = 4
    ) -> list[RagChunk]:
        # Sem embeddings/OpenAI no modo dev.
        return []


class FakeConversationMemory:
    async def load(self, conversation_id: str) -> list[dict]:
        return []

    async def save(self, conversation_id: str, query: str, answer: str) -> None:
        return None


class FakeRagCache:
    async def get(self, agent_id: str, query: str) -> dict | None:
        return None

    async def set(self, agent_id: str, query: str, value: dict) -> None:
        return None
