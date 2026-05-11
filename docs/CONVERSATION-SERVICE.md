# Conversation Service (Closed Chat)

NestJS service for managing conversations, messages, and invites in the closed chat. The primary communication is via gRPC, with PostgreSQL (Prisma) persistence, RabbitMQ message consumption, and HTTP observability.

## Overview

The service exposes conversation, message, and invite operations over gRPC (`conversation.ConversationService`, `conversation.MessageService`, `conversation.InviteService`) and uses use cases in the `application` layer without direct coupling to infrastructure details.

Key features:

- conversations with participants (`participantIds`)
- messages per conversation with cursor pagination
- invites with status (pending/accepted/rejected)
- real-time notifications via WebSocket (gateway)

## Architecture

Layered structure with dependency inversion:

- `domain/entities`: business entities (`Conversation`, `Message`, `Invite`, `MessageConnection`)
- `application/usecases`: rule orchestration
- `application/ports`: input and output contracts
- `infra/repositories`: Prisma implementations
- `infra/database/prisma`: schema, migrations, and seeders
- `infra/consumers`: RabbitMQ consumers
- `interface/grpc/controllers`: gRPC handlers
- `interface/controllers`: HTTP observability endpoints
- `interface/gateways`: WebSocket (Socket.IO)
- `interface/presenters`: output mapping for gRPC

## Technical Decisions

- **gRPC instead of GraphQL**: typed Protobuf contract for service-to-service integration.
- **Prisma + PostgreSQL**: relational persistence with migrations and seeders.
- **RabbitMQ**: async integration for message events.
- **WebSocket (Socket.IO)**: real-time events for connected clients.
- **Validation with class-validator**: input validation at the interface layer.
- **Prometheus**: metrics exposed via HTTP endpoint.

## Technologies

- Node.js
- NestJS
- Prisma
- PostgreSQL
- gRPC (grpc-js)
- RabbitMQ (amqplib)
- Socket.IO
- Jest
- k6 (stress)

## Configuration

Supported environment variables:

- `DATABASE_URL`
- `RABBITMQ_URL`
- `RABBITMQ_QUEUE`
- `PORT` (HTTP, default 3000)
- `GRPC_PORT` (gRPC, default 50051)

Example (Linux/macOS):

```bash
export DATABASE_URL='postgresql://postgres:postgres@localhost:5432/conversation'
export RABBITMQ_URL='amqp://localhost:5672'
export RABBITMQ_QUEUE='conversation.queue'
export PORT=3000
export GRPC_PORT=50051
```

## How to run the service

```bash
pnpm install
pnpm start:dev
```

Ports and endpoints:

- HTTP: `http://localhost:3000`
- Health: `http://localhost:3000/health`
- Metrics: `http://localhost:3000/metrics`
- gRPC: `0.0.0.0:50051`

## How to run tests

```bash
pnpm test
pnpm test:e2e
pnpm test:cov
```

Stress tests (k6):

```bash
k6 run test/stress/flow-create-conversation-and-message.ts
k6 run test/stress/flow-multiple-messages.ts
k6 run test/stress/flow-multiple-conversations.ts
k6 run test/stress/flow-edit-conversation.ts
```

## gRPC Contract

Proto file:

- `services/conversation/src/interface/grpc/conversation.proto`

Exposed services:

- `conversation.ConversationService`
- `conversation.MessageService`
- `conversation.InviteService`

Methods:

- ConversationService: `CreateConversation`, `GetConversation`, `ListConversations`, `UpdateConversation`, `DeleteConversation`
- MessageService: `CreateMessage`, `GetMessage`, `ListMessages`, `ListMessagesByConversation`, `UpdateMessage`, `DeleteMessage`
- InviteService: `CreateInvite`, `GetInvite`, `ListInvitesByConversation`, `AcceptInvite`, `RejectInvite`

Notes:

- `id` is transferred as `string`.
- `createdAt` and `updatedAt` are transferred as ISO `string`.
- Message listings use cursor pagination (`cursor`, `limit`).
