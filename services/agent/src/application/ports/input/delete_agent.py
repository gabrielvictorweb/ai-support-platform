from abc import ABC, abstractmethod


class IDeleteAgent(ABC):
    @abstractmethod
    async def execute(self, agent_id: str) -> bool: ...
