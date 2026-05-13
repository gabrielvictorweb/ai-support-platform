from abc import ABC, abstractmethod

from src.application.dtos.agent_dto import AgentOutput


class IListAgents(ABC):
    @abstractmethod
    async def execute(self, conversation_id: str) -> list[AgentOutput]: ...
