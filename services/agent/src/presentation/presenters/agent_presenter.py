from src.application.dtos.agent_dto import AgentOutput
from src.presentation.grpc.generated import agents_pb2


class AgentPresenter:
    @staticmethod
    def to_proto(output: AgentOutput) -> agents_pb2.Agent:
        return agents_pb2.Agent(
            id=output.id,
            conversation_id=output.conversation_id,
            name=output.name,
            system_prompt=output.system_prompt,
            model=output.model,
            created_at=output.created_at,
            updated_at=output.updated_at,
        )
