from src.application.dtos.agent_dto import AgentOutput
from src.application.ports.input.update_agent import IUpdateAgent
from src.application.ports.output.agent_repository import IAgentRepository
from src.domain.errors.agent_not_found import AgentNotFoundError


class UpdateAgentUseCase(IUpdateAgent):
    def __init__(self, repo: IAgentRepository) -> None:
        self._repo = repo

    async def execute(
        self,
        agent_id: str,
        name: str | None,
        system_prompt: str | None,
        model: str | None,
    ) -> AgentOutput:
        fields = {k: v for k, v in {"name": name, "system_prompt": system_prompt, "model": model}.items() if v is not None}
        updated = await self._repo.update(agent_id, **fields)
        if updated is None:
            raise AgentNotFoundError(agent_id)
        return AgentOutput.from_entity(updated)
