# Agent Service

Python service responsible for AI agent configuration and RAG-based query answering. It exposes a gRPC API consumed by the BFF and an HTTP API for document ingestion and observability.

## Overview

The Agent Service manages AI agents and their associated knowledge bases. Each agent is tied to a conversation and has its own system prompt, model configuration, and document collection. When a query arrives, the service retrieves the most relevant document chunks from MongoDB, injects them into the prompt alongside the conversation history, and calls the LLM to generate a contextual answer.

Key responsibilities:

- CRUD for AI agents (linked to conversations)
- Document ingestion and vector indexing per agent
- RAG query pipeline: retrieve relevant chunks, inject into context, generate answer
- Conversation memory with progressive summarization
- RAG result caching to reduce LLM API costs

## Architecture

Follows the same four-layer layout as the other NestJS services in this monorepo, adapted for Python:

```
src/
  domain/          # entities and pure domain logic; no framework dependencies
  application/
    usecases/      # orchestration; depends on ports (interfaces), not implementations
    ports/
      input/       # use-case interfaces (driven by presentation)
      output/      # repository/gateway interfaces (implemented in infra)
    dtos/          # data transfer objects used across layers
  infra/
    repositories/  # Motor (async MongoDB) implementation of IAgentRepository
    langchain/     # RAG pipeline, vector store, conversation memory
    redis/         # Redis client, RAG result cache
    modules/       # dependency-injector container (DI wiring)
  presentation/
    grpc/          # gRPC servicers, server bootstrap, generated stubs, agents.proto
    http/          # FastAPI app, routers (health, metrics, ingest)
    presenters/    # map domain entities to response DTOs
```

Two servers run in a single process:

- gRPC server on port `50053` — consumed by the BFF
- FastAPI (uvicorn) on port `8000` — health, metrics, document ingestion endpoint

## Technologies

- Python 3.12
- FastAPI + uvicorn
- gRPC (`grpcio`, `grpcio-tools`)
- LangChain (`langchain`, `langchain-openai`, `langchain-mongodb`)
- MongoDB + Motor (async driver)
- Redis (`redis[asyncio]`)
- dependency-injector
- pytest + pytest-asyncio

## RAG Pipeline

### Document ingestion

```
raw text
  -> RecursiveCharacterTextSplitter (chunk_size=1000, overlap=200)
  -> OpenAI text-embedding-3-small  (1536-dim vectors)
  -> stored in MongoDB collection agent_chunks
     { _id, agent_id, content, embedding, source, metadata }
```

After ingestion, all cached RAG results for that agent are invalidated from Redis.

### Query flow

```
QueryAgent(agent_id, conversation_id, query)
  1. Check Redis RAG cache -> return on hit
  2. Load agent from MongoDB
  3. Load conversation history from Redis
  4. similarity_search(agent_id, query, top_k=4) -> MongoDB
  5. RagPipeline.generate(system_prompt, query, chunks, history) -> OpenAI
  6. Save new turn to conversation memory
  7. Write result to RAG cache
  8. Return answer + source chunks
```

### Local vs Atlas vector search

| Mode | How to set | Search strategy |
|---|---|---|
| Local (default) | `USE_LOCAL_VECTOR_SEARCH=true` | Brute-force cosine similarity in Python (numpy) |
| Atlas | `USE_LOCAL_VECTOR_SEARCH=false` | MongoDB Atlas Vector Search index (`vector_index`) |

Use the local mode during development. Atlas is required for production scale.

When using Atlas, create a vector search index on collection `agent_chunks` with field `embedding` (1536 dimensions, similarity `cosine`).

## Conversation Memory

Conversation history is stored in Redis under key `conv_memory:{conversation_id}` as a JSON list of `{role, content}` pairs.

The memory uses **progressive summarization** to handle long conversations:

- When the history reaches `MEMORY_SUMMARIZE_AFTER_TURNS` turns (default: 20), the oldest `MEMORY_TURNS_TO_SUMMARIZE` turns (default: 10) are sent to the LLM for summarization.
- The summary replaces those turns as a single system message, preserving key facts without consuming the full context window.
- If the summarization call fails (timeout, API error), it falls back silently to a sliding window of the last 40 messages.

TTL: `CONVERSATION_MEMORY_TTL_SECONDS` (default: 3600s). A conversation idle for more than 1 hour starts fresh.

## RAG Result Cache

RAG responses are cached in Redis under key `rag_cache:{agent_id}:{sha256(normalized_query)[:16]}`.

- TTL: `RAG_CACHE_TTL_SECONDS` (default: 300s)
- Query normalization: lowercase + strip whitespace before hashing, to improve hit rates across minor variations
- Invalidated automatically after document ingestion for a given agent

## gRPC API

Proto file: `services/agent/src/presentation/grpc/agents.proto`

### AgentService

| RPC | Request | Response |
|---|---|---|
| `GetAgentsByConversationIds` | `{conversation_ids: [string]}` | `{items: [{conversation_id, agents: [Agent]}]}` |
| `CreateAgent` | `{conversation_id, name, system_prompt, model}` | `AgentResponse` |
| `GetAgent` | `{id}` | `AgentResponse` |
| `ListAgents` | `{conversation_id}` | `{agents: [Agent]}` |
| `UpdateAgent` | `{id, name, system_prompt, model}` | `AgentResponse` |
| `DeleteAgent` | `{id}` | `{success: bool}` |

### RagService

| RPC | Request | Response |
|---|---|---|
| `IngestDocuments` | `{agent_id, documents: [{content, source, metadata}]}` | `{ingested_count, chunk_ids}` |
| `QueryAgent` | `{agent_id, conversation_id, query, top_k}` | `{answer, sources: [RetrievedChunk]}` |

## HTTP API

Base URL: `http://localhost:8000`

| Method | Path | Description |
|---|---|---|
| `GET` | `/health` | Liveness probe |
| `GET` | `/metrics` | Prometheus metrics |
| `POST` | `/ingest` | Ingest documents into a specific agent's knowledge base |

### POST /ingest

```json
{
  "agent_id": "string",
  "documents": [
    {
      "content": "string",
      "source": "string",
      "metadata": {}
    }
  ]
}
```

## Configuration

| Variable | Default | Description |
|---|---|---|
| `GRPC_PORT` | `50053` | gRPC server port |
| `HTTP_PORT` | `8000` | FastAPI server port |
| `MONGODB_URL` | `mongodb://admin:admin@localhost:27017` | MongoDB connection string |
| `MONGODB_DB` | `agent_db` | Database name |
| `REDIS_URL` | `redis://localhost:6379` | Redis connection string |
| `OPENAI_API_KEY` | — | Required |
| `OPENAI_EMBEDDING_MODEL` | `text-embedding-3-small` | Embedding model |
| `OPENAI_CHAT_MODEL` | `gpt-4o-mini` | Generation model |
| `USE_LOCAL_VECTOR_SEARCH` | `true` | Use brute-force local search instead of Atlas |
| `RAG_CACHE_TTL_SECONDS` | `300` | TTL for cached RAG results |
| `CONVERSATION_MEMORY_TTL_SECONDS` | `3600` | TTL for conversation history |
| `MEMORY_SUMMARIZE_AFTER_TURNS` | `20` | Turns before progressive summarization triggers |
| `MEMORY_TURNS_TO_SUMMARIZE` | `10` | Oldest turns to compress into a summary |

## How to run the service

```bash
cd services/agent

# first time only
uv venv .venv
uv pip install -e ".[dev]"

cp .env.example .env   # fill OPENAI_API_KEY

# start infrastructure
docker compose -f ../../infra/docker/mongodb/docker-compose.yml up -d
docker compose -f ../../infra/docker/redis/docker-compose.yml up -d

# start the service
.venv/bin/python -m src.main
```

## How to run tests

```bash
cd services/agent
.venv/bin/python -m pytest tests/ -v
```

## Regenerate gRPC stubs

Run this whenever `agents.proto` is modified. The output goes to `src/presentation/grpc/generated/` and must be committed.

```bash
cd services/agent
.venv/bin/python -m grpc_tools.protoc \
  -I src/presentation/grpc \
  --python_out=src/presentation/grpc/generated \
  --grpc_python_out=src/presentation/grpc/generated \
  src/presentation/grpc/agents.proto
```

Also copy the updated proto to the BFF:

```bash
cp src/presentation/grpc/agents.proto \
   ../bff/src/presentation/grpc/proto/agents.proto
```
