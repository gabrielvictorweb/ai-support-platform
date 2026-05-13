from abc import ABC, abstractmethod

from src.application.dtos.rag_dto import QueryResult


class IQueryAgent(ABC):
    @abstractmethod
    async def execute(
        self,
        agent_id: str,
        conversation_id: str,
        query: str,
        top_k: int = 4,
    ) -> QueryResult: ...
