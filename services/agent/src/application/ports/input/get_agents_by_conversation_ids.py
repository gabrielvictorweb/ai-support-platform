from abc import ABC, abstractmethod

from src.application.dtos.agent_dto import AgentOutput


class IGetAgentsByConversationIds(ABC):
    @abstractmethod
    async def execute(self, conversation_ids: list[str]) -> dict[str, list[AgentOutput]]: ...
