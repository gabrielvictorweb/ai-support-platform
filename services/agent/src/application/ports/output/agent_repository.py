from abc import ABC, abstractmethod

from src.domain.entities.agent import Agent


class IAgentRepository(ABC):
    @abstractmethod
    async def create(self, agent: Agent) -> Agent: ...

    @abstractmethod
    async def find_by_id(self, id: str) -> Agent | None: ...

    @abstractmethod
    async def find_by_conversation_ids(
        self, conversation_ids: list[str]
    ) -> dict[str, list[Agent]]: ...

    @abstractmethod
    async def find_by_conversation_id(self, conversation_id: str) -> list[Agent]: ...

    @abstractmethod
    async def update(self, id: str, **fields: object) -> Agent | None: ...

    @abstractmethod
    async def delete(self, id: str) -> bool: ...
