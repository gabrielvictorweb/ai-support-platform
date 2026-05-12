# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

### Root (monorepo)

```bash
pnpm commit          # interactive conventional commit via Commitizen
pnpm release         # bump version and generate CHANGELOG
```

### BFF (`services/bff`)

```bash
pnpm start:dev       # development with watch
pnpm build           # compile TypeScript
pnpm lint            # ESLint with auto-fix
pnpm test            # unit tests (Jest)
pnpm test:cov        # unit tests with coverage
pnpm test:e2e        # end-to-end tests
```

Run a single test file:
```bash
pnpm test -- --testPathPattern=<file>
```

### Conversation Service (`services/conversation`)

Same scripts as BFF. Additionally:

```bash
npx prisma migrate dev   # apply DB migrations
npx prisma generate      # regenerate Prisma client
```

### Web App (`apps/web`)

```bash
pnpm dev     # Next.js dev server
pnpm build   # production build
pnpm lint    # ESLint
```

### Infrastructure

```bash
docker compose -f infra/docker/postgres/docker-compose.yml up -d
docker compose -f infra/docker/rabbitmq/docker-compose.yml up -d
docker compose -f infra/docker/redis/docker-compose.yml up -d
```

## Architecture

This is a pnpm monorepo (`services/*`, `apps/*`, `libs/*`) for an AI-powered customer support platform.

### Services

| Service | Language | Port | Role |
|---|---|---|---|
| `services/bff` | NestJS / TypeScript | 3000 (HTTP/GraphQL) | Entry point; aggregates all downstream services |
| `services/conversation` | NestJS / TypeScript | 50052 (gRPC) | Conversation, message, invite management |
| `services/user` | Spring Boot / Java | 50051 (gRPC) | Auth, user management |
| `services/agent` | NestJS / TypeScript | 50053 (gRPC) | AI agent configuration |
| `apps/web` | Next.js 16 / React 19 | - | Frontend (App Router) |

### Communication

- **Frontend → BFF**: GraphQL (Apollo Server at `/graphql`)
- **BFF → downstream services**: gRPC with Protobuf contracts
- **Async processing**: RabbitMQ (`conversation.queue`) consumed by conversation-service
- **Real-time events**: Socket.IO gateway in conversation-service

Proto files live alongside the service that owns the contract:
- `services/conversation/src/presentation/grpc/conversation.proto` — defines `ConversationService`, `MessageService`, `InviteService`
- `services/bff/src/presentation/grpc/proto/` — client-side copies used by BFF

### Layered architecture (NestJS services)

Each NestJS service follows a strict four-layer layout:

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
    repositories/  # Prisma implementations of output ports
    consumers/     # RabbitMQ consumers
    modules/       # NestJS DI wiring
  presentation/
    grpc/          # gRPC controllers
    graphql/       # GraphQL resolvers (BFF only)
    gateways/      # WebSocket gateways
    presenters/    # map domain entities to response DTOs
```

Use cases receive ports via constructor injection and must not import infra or presentation directly.

### BFF specifics

- DataLoaders (`src/infra/graphql/loaders/`) batch and cache calls to downstream gRPC services to avoid N+1 patterns.
- Auth guards (`src/infra/graphql/auth/guards/`) protect resolvers.

### Conversation service specifics

- Prisma schema: `src/infra/database/prisma/schema.prisma` (models: `Conversation`, `Message`, `Participant`, `Invite`; PostgreSQL with UUIDs)
- Generated client output: `src/infra/database/generated/prisma/`
- RabbitMQ consumer triggers message creation asynchronously

### Web app specifics

Next.js 16 has breaking changes from earlier versions. Before writing any Next.js code, read the relevant guide in `node_modules/next/dist/docs/`.

## Commits

This project uses Commitizen with conventional-changelog. Always commit via `pnpm commit` from the root, or follow the `<type>(<scope>): <subject>` format manually. Husky enforces commitlint on every commit.
