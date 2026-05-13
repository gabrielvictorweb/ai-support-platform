from src.application.dtos.rag_dto import QueryResult
from src.application.ports.input.query_agent import IQueryAgent
from src.application.ports.output.agent_repository import IAgentRepository
from src.application.ports.output.llm_gateway import ILlmGateway
from src.application.ports.output.vector_store import IVectorStore
from src.domain.errors.agent_not_found import AgentNotFoundError


class QueryAgentUseCase(IQueryAgent):
    def __init__(
        self,
        repo: IAgentRepository,
        vector_store: IVectorStore,
        llm_gateway: ILlmGateway,
        rag_cache: object,
        conversation_memory: object,
    ) -> None:
        self._repo = repo
        self._vector_store = vector_store
        self._llm_gateway = llm_gateway
        self._rag_cache = rag_cache
        self._conversation_memory = conversation_memory

    async def execute(
        self,
        agent_id: str,
        conversation_id: str,
        query: str,
        top_k: int = 4,
    ) -> QueryResult:
        cached = await self._rag_cache.get(agent_id, query)
        if cached:
            return QueryResult(answer=cached["answer"], sources=cached["sources"])

        agent = await self._repo.find_by_id(agent_id)
        if agent is None:
            raise AgentNotFoundError(agent_id)

        history = await self._conversation_memory.load(conversation_id)
        chunks = await self._vector_store.similarity_search(agent_id, query, top_k)
        context = [c.content for c in chunks]

        answer = await self._llm_gateway.generate(
            system_prompt=agent.system_prompt,
            user_query=query,
            context_chunks=context,
            conversation_history=history,
        )

        await self._conversation_memory.save(conversation_id, query, answer)
        await self._rag_cache.set(agent_id, query, {"answer": answer, "sources": chunks})

        return QueryResult(answer=answer, sources=chunks)
