FROM python:3.12-slim AS base
WORKDIR /app
RUN pip install uv

FROM base AS deps
COPY pyproject.toml ./
RUN uv sync --no-dev

FROM deps AS build
COPY src/ ./src/
RUN python -m grpc_tools.protoc \
    -I src/presentation/grpc \
    --python_out=src/presentation/grpc/generated \
    --grpc_python_out=src/presentation/grpc/generated \
    src/presentation/grpc/agents.proto

FROM base AS runner
ENV PYTHONPATH=/app
COPY --from=build /app/.venv ./.venv
COPY --from=build /app/src ./src
ENV PATH="/app/.venv/bin:$PATH"
EXPOSE 50053 8000
CMD ["python", "-m", "src.main"]
