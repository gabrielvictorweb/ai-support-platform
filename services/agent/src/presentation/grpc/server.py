import asyncio
import os

import grpc

from src.config import settings
from src.presentation.grpc.agent_servicer import AgentServiceServicer
from src.presentation.grpc.generated import agents_pb2_grpc
from src.presentation.grpc.rag_servicer import RagServiceServicer


def _build_server_credentials() -> grpc.ServerCredentials | None:
    ca = os.environ.get("GRPC_CA_CERT")
    key = os.environ.get("GRPC_SERVER_KEY")
    cert = os.environ.get("GRPC_SERVER_CERT")

    if ca and key and cert:
        return grpc.ssl_server_credentials(
            [(open(key, "rb").read(), open(cert, "rb").read())],
            root_certificates=open(ca, "rb").read(),
            require_client_auth=True,
        )

    return None


def serve_grpc(container: object) -> None:
    asyncio.run(_serve())


async def _serve() -> None:
    server = grpc.aio.server()
    agents_pb2_grpc.add_AgentServiceServicer_to_server(AgentServiceServicer(), server)
    agents_pb2_grpc.add_RagServiceServicer_to_server(RagServiceServicer(), server)

    credentials = _build_server_credentials()
    address = f"0.0.0.0:{settings.grpc_port}"

    if credentials:
        server.add_secure_port(address, credentials)
    else:
        server.add_insecure_port(address)

    await server.start()
    await server.wait_for_termination()
