from src.application.dtos.agent_dto import AgentOutput
from src.application.ports.input.list_agents import IListAgents
from src.application.ports.output.agent_repository import IAgentRepository


class ListAgentsUseCase(IListAgents):
    def __init__(self, repo: IAgentRepository) -> None:
        self._repo = repo

    async def execute(self, conversation_id: str) -> list[AgentOutput]:
        agents = await self._repo.find_by_conversation_id(conversation_id)
        return [AgentOutput.from_entity(a) for a in agents]
