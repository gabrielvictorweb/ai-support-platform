import grpc
from dependency_injector.wiring import Provide, inject

from src.application.usecases.create_agent import CreateAgentUseCase
from src.application.usecases.delete_agent import DeleteAgentUseCase
from src.application.usecases.get_agent import GetAgentUseCase
from src.application.usecases.get_agents_by_conversation_ids import GetAgentsByConversationIdsUseCase
from src.application.usecases.list_agents import ListAgentsUseCase
from src.application.usecases.update_agent import UpdateAgentUseCase
from src.domain.errors.agent_not_found import AgentNotFoundError
from src.infra.modules.container import Container
from src.presentation.grpc.generated import agents_pb2, agents_pb2_grpc
from src.presentation.presenters.agent_presenter import AgentPresenter


class AgentServiceServicer(agents_pb2_grpc.AgentServiceServicer):
    @inject
    def __init__(
        self,
        get_agents_uc: GetAgentsByConversationIdsUseCase = Provide[
            Container.get_agents_by_conversation_ids_uc
        ],
        create_agent_uc: CreateAgentUseCase = Provide[Container.create_agent_uc],
        get_agent_uc: GetAgentUseCase = Provide[Container.get_agent_uc],
        list_agents_uc: ListAgentsUseCase = Provide[Container.list_agents_uc],
        update_agent_uc: UpdateAgentUseCase = Provide[Container.update_agent_uc],
        delete_agent_uc: DeleteAgentUseCase = Provide[Container.delete_agent_uc],
    ) -> None:
        self._get_agents_uc = get_agents_uc
        self._create_agent_uc = create_agent_uc
        self._get_agent_uc = get_agent_uc
        self._list_agents_uc = list_agents_uc
        self._update_agent_uc = update_agent_uc
        self._delete_agent_uc = delete_agent_uc

    async def GetAgentsByConversationIds(self, request, context):
        result = await self._get_agents_uc.execute(list(request.conversation_ids))
        items = [
            agents_pb2.ConversationAgents(
                conversation_id=cid,
                agents=[AgentPresenter.to_proto(a) for a in agents],
            )
            for cid, agents in result.items()
        ]
        return agents_pb2.GetAgentsByConversationIdsResponse(items=items)

    async def CreateAgent(self, request, context):
        output = await self._create_agent_uc.execute(
            conversation_id=request.conversation_id,
            name=request.name,
            system_prompt=request.system_prompt,
            model=request.model,
        )
        return agents_pb2.AgentResponse(agent=AgentPresenter.to_proto(output))

    async def GetAgent(self, request, context):
        try:
            output = await self._get_agent_uc.execute(request.id)
            return agents_pb2.AgentResponse(agent=AgentPresenter.to_proto(output))
        except AgentNotFoundError:
            await context.abort(grpc.StatusCode.NOT_FOUND, f"Agent '{request.id}' not found")

    async def ListAgents(self, request, context):
        outputs = await self._list_agents_uc.execute(request.conversation_id)
        return agents_pb2.ListAgentsResponse(
            agents=[AgentPresenter.to_proto(o) for o in outputs]
        )

    async def UpdateAgent(self, request, context):
        try:
            output = await self._update_agent_uc.execute(
                agent_id=request.id,
                name=request.name or None,
                system_prompt=request.system_prompt or None,
                model=request.model or None,
            )
            return agents_pb2.AgentResponse(agent=AgentPresenter.to_proto(output))
        except AgentNotFoundError:
            await context.abort(grpc.StatusCode.NOT_FOUND, f"Agent '{request.id}' not found")

    async def DeleteAgent(self, request, context):
        try:
            await self._delete_agent_uc.execute(request.id)
            return agents_pb2.DeleteResult(success=True)
        except AgentNotFoundError:
            await context.abort(grpc.StatusCode.NOT_FOUND, f"Agent '{request.id}' not found")
