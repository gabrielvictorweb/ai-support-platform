import uuid

from src.application.dtos.agent_dto import AgentOutput
from src.application.ports.input.create_agent import ICreateAgent
from src.application.ports.output.agent_repository import IAgentRepository
from src.domain.entities.agent import Agent


class CreateAgentUseCase(ICreateAgent):
    def __init__(self, repo: IAgentRepository) -> None:
        self._repo = repo

    async def execute(
        self,
        conversation_id: str,
        name: str,
        system_prompt: str,
        model: str,
    ) -> AgentOutput:
        agent = Agent(
            id=str(uuid.uuid4()),
            conversation_id=conversation_id,
            name=name,
            system_prompt=system_prompt,
            model=model,
        )
        created = await self._repo.create(agent)
        return AgentOutput.from_entity(created)
