from dataclasses import dataclass

from src.domain.entities.agent import Agent


@dataclass
class AgentOutput:
    id: str
    conversation_id: str
    name: str
    system_prompt: str
    model: str
    created_at: str
    updated_at: str

    @staticmethod
    def from_entity(agent: Agent) -> "AgentOutput":
        return AgentOutput(
            id=agent.id,
            conversation_id=agent.conversation_id,
            name=agent.name,
            system_prompt=agent.system_prompt,
            model=agent.model,
            created_at=agent.created_at.isoformat(),
            updated_at=agent.updated_at.isoformat(),
        )
