from src.application.dtos.agent_dto import AgentOutput
from src.application.ports.input.get_agent import IGetAgent
from src.application.ports.output.agent_repository import IAgentRepository
from src.domain.errors.agent_not_found import AgentNotFoundError


class GetAgentUseCase(IGetAgent):
    def __init__(self, repo: IAgentRepository) -> None:
        self._repo = repo

    async def execute(self, agent_id: str) -> AgentOutput:
        agent = await self._repo.find_by_id(agent_id)
        if agent is None:
            raise AgentNotFoundError(agent_id)
        return AgentOutput.from_entity(agent)
