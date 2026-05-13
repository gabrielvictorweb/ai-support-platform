import asyncio

import grpc

from src.config import settings
from src.presentation.grpc.agent_servicer import AgentServiceServicer
from src.presentation.grpc.generated import agents_pb2_grpc
from src.presentation.grpc.rag_servicer import RagServiceServicer


def serve_grpc(container: object) -> None:
    asyncio.run(_serve())


async def _serve() -> None:
    server = grpc.aio.server()
    agents_pb2_grpc.add_AgentServiceServicer_to_server(AgentServiceServicer(), server)
    agents_pb2_grpc.add_RagServiceServicer_to_server(RagServiceServicer(), server)
    server.add_insecure_port(f"0.0.0.0:{settings.grpc_port}")
    await server.start()
    await server.wait_for_termination()
