FROM python:3.12-slim AS base
WORKDIR /app
RUN pip install uv

FROM base AS deps
COPY pyproject.toml ./
RUN uv sync --no-dev

FROM deps AS runner
ENV PYTHONPATH=/app
COPY --from=deps /app/.venv ./.venv
COPY src/ ./src/
ENV PATH="/app/.venv/bin:$PATH"
EXPOSE 50053 8000
CMD ["python", "-m", "src.main"]
