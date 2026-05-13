from abc import ABC, abstractmethod

from src.domain.entities.document import Document
from src.domain.entities.rag_chunk import RagChunk


class IVectorStore(ABC):
    @abstractmethod
    async def add_documents(self, agent_id: str, documents: list[Document]) -> list[str]: ...

    @abstractmethod
    async def similarity_search(
        self, agent_id: str, query: str, top_k: int = 4
    ) -> list[RagChunk]: ...
