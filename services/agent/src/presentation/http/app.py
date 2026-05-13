from fastapi import FastAPI

from src.presentation.http.routers import health, ingest, metrics


def create_app(container: object) -> FastAPI:
    app = FastAPI(title="Agent Service", version="0.1.0")
    app.container = container  # type: ignore[attr-defined]
    app.include_router(health.router)
    app.include_router(metrics.router)
    app.include_router(ingest.router, prefix="/ingest")
    return app
