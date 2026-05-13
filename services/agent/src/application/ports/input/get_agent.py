from abc import ABC, abstractmethod

from src.application.dtos.agent_dto import AgentOutput


class IGetAgent(ABC):
    @abstractmethod
    async def execute(self, agent_id: str) -> AgentOutput: ...
