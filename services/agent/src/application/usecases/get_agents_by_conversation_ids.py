from src.application.dtos.agent_dto import AgentOutput
from src.application.ports.input.get_agents_by_conversation_ids import IGetAgentsByConversationIds
from src.application.ports.output.agent_repository import IAgentRepository


class GetAgentsByConversationIdsUseCase(IGetAgentsByConversationIds):
    def __init__(self, repo: IAgentRepository) -> None:
        self._repo = repo

    async def execute(self, conversation_ids: list[str]) -> dict[str, list[AgentOutput]]:
        raw = await self._repo.find_by_conversation_ids(conversation_ids)
        return {
            cid: [AgentOutput.from_entity(a) for a in agents]
            for cid, agents in raw.items()
        }
