from src.application.dtos.rag_dto import IngestResult
from src.application.ports.input.ingest_documents import IIngestDocuments
from src.application.ports.output.vector_store import IVectorStore
from src.domain.entities.document import Document


class IngestDocumentsUseCase(IIngestDocuments):
    def __init__(self, vector_store: IVectorStore) -> None:
        self._vector_store = vector_store

    async def execute(self, agent_id: str, documents: list[Document]) -> IngestResult:
        chunk_ids = await self._vector_store.add_documents(agent_id, documents)
        return IngestResult(ingested_count=len(chunk_ids), chunk_ids=chunk_ids)
