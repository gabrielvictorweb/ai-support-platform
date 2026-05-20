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

## Authentication

The BFF is the single JWT validation point for the platform. Every authenticated GraphQL request goes through:

1. `GraphqlAuthGuard` extracts the Bearer token from the `Authorization` header.
2. `JwtService` verifies the token via Auth0 JWKS (`createRemoteJWKSet` from `jose`).
3. The validated `sub`, `name`, and `email` claims are attached to the GraphQL context.
4. `GetOrProvisionUserUseCase` performs a find-or-create on the user service using the `sub` as `externalId`.

Internal gRPC services receive only the resolved `userId` and have no dependency on Auth0.

## Configuration

Environment variables:

| Variable | Description |
|---|---|
| `PORT` | HTTP port (default `3000`) |
| `USERS_GRPC_URL` | User service gRPC address (default `localhost:7000`) |
| `CONVERSATIONS_GRPC_URL` | Conversation service gRPC address (default `localhost:50052`) |
| `AGENTS_GRPC_URL` | Agent service gRPC address (default `localhost:50053`) |
| `AUTH0_DOMAIN` | Auth0 tenant domain (e.g. `dev-xxx.us.auth0.com`) |
| `AUTH0_AUDIENCE` | Auth0 API identifier (e.g. `https://api.ai-support.local`) |
| `GRPC_CA_CERT` | Path to CA certificate for mTLS (optional) |
| `GRPC_CLIENT_KEY` | Path to BFF client private key for mTLS (optional) |
| `GRPC_CLIENT_CERT` | Path to BFF client certificate for mTLS (optional) |

mTLS is disabled when the `GRPC_CA_CERT`, `GRPC_CLIENT_KEY`, and `GRPC_CLIENT_CERT` variables are absent. See [INFRASTRUCTURE.md](../docs/INFRASTRUCTURE.md) for cert generation.

Example (Linux/macOS, local development):

```bash
export PORT=3000
export USERS_GRPC_URL='localhost:7000'
export CONVERSATIONS_GRPC_URL='localhost:50052'
export AGENTS_GRPC_URL='localhost:50053'
export AUTH0_DOMAIN='dev-xxx.us.auth0.com'
export AUTH0_AUDIENCE='https://api.ai-support.local'
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
