from src.application.ports.input.delete_agent import IDeleteAgent
from src.application.ports.output.agent_repository import IAgentRepository
from src.domain.errors.agent_not_found import AgentNotFoundError


class DeleteAgentUseCase(IDeleteAgent):
    def __init__(self, repo: IAgentRepository) -> None:
        self._repo = repo

    async def execute(self, agent_id: str) -> bool:
        deleted = await self._repo.delete(agent_id)
        if not deleted:
            raise AgentNotFoundError(agent_id)
        return True
