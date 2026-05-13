# AI Support Platform

AI-powered customer support platform built with a microservices architecture, designed to seamlessly switch between human agents and intelligent automation.

---

## Overview

This project is a scalable support system that handles customer conversations in real time. When human agents are available, interactions are routed to them. When they are not, an AI-powered assistant takes over to ensure uninterrupted support.

The system is designed with clear service boundaries, enabling flexibility, scalability, and maintainability.

---

## Services

| Service | Language | Port | Role |
| --- | --- | --- | --- |
| `services/bff` | NestJS / TypeScript | 3000 (HTTP/GraphQL) | Entry point; aggregates all downstream services |
| `services/conversation` | NestJS / TypeScript | 3000 (HTTP), 50052 (gRPC) | Conversation, message, and invite management |
| `services/user` | Spring Boot / Java | 8080 (HTTP), 7000 (gRPC) | Auth and user management |
| `services/agent` | Python / FastAPI | 8000 (HTTP), 50053 (gRPC) | AI agent configuration and RAG pipeline |
| `apps/web` | Next.js / React | 3000 (dev) | Frontend (App Router) |

---

## Quick start (Docker)

```bash
# 1. create shared network
docker network create ai-support

# 2. start infrastructure
docker compose -f infra/docker/postgres/docker-compose.yml up -d
docker compose -f infra/docker/rabbitmq/docker-compose.yml up -d
docker compose -f infra/docker/redis/docker-compose.yml up -d
docker compose -f infra/docker/mongodb/docker-compose.yml up -d

# 3. build and start all application services
docker compose up -d

# 4. start observability stack
docker compose -f infra/observability/docker-compose.yml up -d
```

See [docs/INFRASTRUCTURE.md](docs/INFRASTRUCTURE.md) for the full setup guide, including the user service first-run migration workaround.

---

## Observability

| Tool | URL | Credentials |
| --- | --- | --- |
| Grafana | <http://localhost:3001> | admin / admin |
| Prometheus | <http://localhost:9091> | — |
| Prometheus targets | <http://localhost:9091/targets> | — |

Grafana starts fully pre-configured with datasources and dashboards for all services and infrastructure components.

---

## Local development

Each service has its own scripts. Run from the service directory:

```bash
pnpm start:dev   # NestJS services (bff, conversation)
./mvnw spring-boot:run  # user service
.venv/bin/python -m src.main  # agent service
pnpm dev  # web (apps/web)
```

For detailed setup per service, see the docs:

- [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md)
- [docs/INFRASTRUCTURE.md](docs/INFRASTRUCTURE.md)
- [docs/BFF.md](docs/BFF.md)
- [docs/CONVERSATION-SERVICE.md](docs/CONVERSATION-SERVICE.md)
- [docs/USER-SERVICE.md](docs/USER-SERVICE.md)
- [docs/AGENT-SERVICE.md](docs/AGENT-SERVICE.md)
- [docs/DEVELOPMENT.md](docs/DEVELOPMENT.md)

---

## Commits

This project uses Commitizen with conventional-changelog. Always commit via:

```bash
pnpm commit
```
