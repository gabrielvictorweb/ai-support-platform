from abc import ABC, abstractmethod

from src.application.dtos.rag_dto import IngestResult
from src.domain.entities.document import Document


class IIngestDocuments(ABC):
    @abstractmethod
    async def execute(self, agent_id: str, documents: list[Document]) -> IngestResult: ...
