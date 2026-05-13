from dependency_injector.wiring import Provide, inject
from fastapi import APIRouter, Depends
from pydantic import BaseModel

from src.application.usecases.ingest_documents import IngestDocumentsUseCase
from src.domain.entities.document import Document
from src.infra.modules.container import Container

router = APIRouter()


class DocumentInput(BaseModel):
    content: str
    source: str
    metadata: dict[str, str] = {}


class IngestRequest(BaseModel):
    agent_id: str
    documents: list[DocumentInput]


@router.post("")
@inject
async def ingest_documents(
    body: IngestRequest,
    use_case: IngestDocumentsUseCase = Depends(Provide[Container.ingest_documents_uc]),
) -> dict:
    documents = [Document(content=d.content, source=d.source, metadata=d.metadata) for d in body.documents]
    result = await use_case.execute(body.agent_id, documents)
    return {"ingested_count": result.ingested_count, "chunk_ids": result.chunk_ids}
