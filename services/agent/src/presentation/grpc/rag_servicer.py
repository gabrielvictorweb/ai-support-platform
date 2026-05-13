import grpc
from dependency_injector.wiring import Provide, inject

from src.application.usecases.ingest_documents import IngestDocumentsUseCase
from src.application.usecases.query_agent import QueryAgentUseCase
from src.domain.entities.document import Document
from src.domain.errors.agent_not_found import AgentNotFoundError
from src.infra.modules.container import Container
from src.presentation.grpc.generated import agents_pb2, agents_pb2_grpc
from src.presentation.presenters.rag_presenter import RagPresenter


class RagServiceServicer(agents_pb2_grpc.RagServiceServicer):
    @inject
    def __init__(
        self,
        ingest_uc: IngestDocumentsUseCase = Provide[Container.ingest_documents_uc],
        query_uc: QueryAgentUseCase = Provide[Container.query_agent_uc],
    ) -> None:
        self._ingest_uc = ingest_uc
        self._query_uc = query_uc

    async def IngestDocuments(self, request, context):
        documents = [
            Document(content=d.content, source=d.source, metadata=dict(d.metadata))
            for d in request.documents
        ]
        result = await self._ingest_uc.execute(request.agent_id, documents)
        return agents_pb2.IngestDocumentsResponse(
            ingested_count=result.ingested_count,
            chunk_ids=result.chunk_ids,
        )

    async def QueryAgent(self, request, context):
        try:
            result = await self._query_uc.execute(
                agent_id=request.agent_id,
                conversation_id=request.conversation_id,
                query=request.query,
                top_k=request.top_k or 4,
            )
            return agents_pb2.QueryAgentResponse(
                answer=result.answer,
                sources=[RagPresenter.chunk_to_proto(c) for c in result.sources],
            )
        except AgentNotFoundError:
            await context.abort(
                grpc.StatusCode.NOT_FOUND, f"Agent '{request.agent_id}' not found"
            )
