from abc import ABC, abstractmethod

from src.application.dtos.agent_dto import AgentOutput


class ICreateAgent(ABC):
    @abstractmethod
    async def execute(
        self,
        conversation_id: str,
        name: str,
        system_prompt: str,
        model: str,
    ) -> AgentOutput: ...
