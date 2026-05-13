import threading

import uvicorn

from src.infra.modules.container import Container
from src.presentation.grpc.server import serve_grpc
from src.presentation.http.app import create_app


def main() -> None:
    container = Container()
    container.wire(
        modules=[
            "src.presentation.grpc.agent_servicer",
            "src.presentation.grpc.rag_servicer",
            "src.presentation.http.routers.ingest",
        ]
    )

    grpc_thread = threading.Thread(target=serve_grpc, args=(container,), daemon=True)
    grpc_thread.start()

    app = create_app(container)
    uvicorn.run(app, host="0.0.0.0", port=container.config.http_port())


if __name__ == "__main__":
    main()
