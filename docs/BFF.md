# BFF (Backend for Frontend)

NestJS service that aggregates data for the frontend. It provides a GraphQL API, orchestrates calls to downstream gRPC services, and shapes responses for the client.

## Overview

The BFF is the single entry point for the frontend. It integrates with user, conversation, and agent services via gRPC clients and exposes a unified GraphQL schema.

Key responsibilities:

- aggregate user, conversation, and agent data
- reduce client round-trips
- enforce API shape for frontend needs
- handle authentication context for GraphQL
- expose Prometheus metrics

## Architecture

Layered structure with clear boundaries:

- `presentation/graphql`: GraphQL schema, DTOs, resolvers
- `presentation/grpc`: gRPC clients for downstream services
- `presentation/http`: HTTP controllers (health, metrics)
- `presentation/presenters`: mapping from application outputs to GraphQL DTOs
- `application/ports`: input/output contracts
- `application/usecases`: orchestration services
- `infra/graphql`: auth guards and DataLoader factories
- `domain/entities`: internal entities used for mapping

## Technical Decisions

- **GraphQL for frontend**: flexible queries and client-driven selection
- **gRPC for downstream**: typed contracts with Protobuf
- **DataLoader**: batching and caching per request to avoid N+1 patterns
- **Presenters**: consistent mapping from outputs to GraphQL DTOs
- **prom-client**: default metrics collected and exposed at `/metrics`

## Technologies

- Node.js
- NestJS
- GraphQL (Apollo)
- gRPC (grpc-js)
- DataLoader
- prom-client
- Jest

## Configuration

Environment variables:

- `PORT` (HTTP, default 3000)
- `USERS_GRPC_URL`
- `CONVERSATIONS_GRPC_URL`
- `AGENTS_GRPC_URL`

Example (Linux/macOS):

```bash
export PORT=3000
export USERS_GRPC_URL='localhost:7000'
export CONVERSATIONS_GRPC_URL='localhost:50052'
export AGENTS_GRPC_URL='localhost:50053'
```

## How to run the service

```bash
cd services/bff
pnpm install
pnpm start:dev
```

Endpoints:

- GraphQL: `http://localhost:3000/graphql`
- Health: `http://localhost:3000/health`
- Metrics: `http://localhost:3000/metrics`

## How to run tests

```bash
pnpm test
pnpm test:e2e
pnpm test:cov
```

## GraphQL API

GraphQL schema is generated at `services/bff/schema.gql`.

Main queries:

- `me`
- `users(ids: [ID!])`

Nested fields:

- `User.conversations`
- `Conversation.agents`
