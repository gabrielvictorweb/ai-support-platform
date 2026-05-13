from abc import ABC, abstractmethod

from src.application.dtos.agent_dto import AgentOutput


class IUpdateAgent(ABC):
    @abstractmethod
    async def execute(
        self,
        agent_id: str,
        name: str | None,
        system_prompt: str | None,
        model: str | None,
    ) -> AgentOutput: ...
