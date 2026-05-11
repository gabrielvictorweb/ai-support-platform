# Conversation Service Agent Guide

This file describes the current structure of the conversation service so agents can make changes safely. The stack is NestJS with layered architecture, HTTP, gRPC, and RabbitMQ integration, and Prisma for persistence.

## Current Overview

The service is organized into four main layers:

- `domain`: core entities and business rules.
- `application`: use cases and input/output ports.
- `infra`: database, Nest modules, queues, repositories, and integrations.
- `interface`: HTTP controllers, gRPC handlers, gateways, presenters, and DTOs.

The bootstrap in [src/main.ts](src/main.ts) starts three entry points at the same time:

- the main HTTP server.
- a RabbitMQ microservice for message consumption.
- a gRPC microservice for the conversation domain contracts.

## Relevant Structure

```text
services/conversation/
├─ src/
│  ├─ main.ts
│  ├─ app.module.ts
│  ├─ config/
│  │  └─ validation-pipe.config.ts
│  ├─ domain/
│  │  └─ entities/
│  ├─ application/
│  │  ├─ dtos/
│  │  ├─ ports/
│  │  │  ├─ input/
│  │  │  └─ output/
│  │  └─ usecases/
│  ├─ infra/
│  │  ├─ consumers/
│  │  ├─ database/
│  │  │  └─ prisma/
│  │  │     ├─ prisma.service.ts
│  │  │     ├─ schema.prisma
│  │  │     ├─ migrations/
│  │  │     └─ seeders/
│  │  ├─ libs/
│  │  │  └─ rabbitmq/
│  │  ├─ modules/
│  │  │  ├─ prisma.module.ts
│  │  │  ├─ conversation.module.ts
│  │  │  ├─ invite.module.ts
│  │  │  ├─ health.module.ts
│  │  │  └─ metrics.module.ts
│  │  └─ repositories/
│  └─ interface/
│     ├─ controllers/
│     ├─ dtos/
│     ├─ gateways/
│     ├─ grpc/
│     │  ├─ conversation.proto
│     │  └─ controllers/
│     └─ presenters/
└─ test/
   ├─ unit/
   │  ├─ domain/
   │  ├─ application/
   │  └─ interface/
   ├─ e2e/
   └─ stress/
```

## Domain And Flows

The core entities today are `Conversation`, `Message`, `Invite`, and `MessageConnection`. The application layer covers creation, listing, update, deletion, and the conversation invite lifecycle.

The main Nest modules are:

- `ConversationModule`: concentrates use cases, repositories, conversation/message gRPC controllers, and the `CreateMessageConsumer` consumer.
- `InviteModule`: concentrates the invite-related use cases and gRPC controllers.
- `HealthModule` and `MetricsModule`: expose HTTP observability endpoints.
- `PrismaModule`: shared persistence foundation.

## Change Rules

- Prefer `domain` and `application` for business rules and orchestration.
- Prefer `infra` for Prisma, Nest modules, queues, consumers, and dependency wiring.
- Prefer `interface` for DTOs, presenters, HTTP controllers, gateways, and gRPC handlers.
- When changing persistence, update `src/infra/database/prisma/schema.prisma`, the corresponding repositories, and any affected seeders.
- When changing an input or output contract, review the interfaces in `src/application/ports` and the DTOs in `src/application/dtos` and `src/interface/dtos`.
- Keep tests aligned in `test/unit`, `test/e2e`, and `test/stress`.

## Useful Commands

```bash
pnpm install
pnpm build
pnpm start
pnpm start:dev
pnpm lint
pnpm test
pnpm test:e2e
pnpm test:cov
```

## Operational Conventions

- Use `pnpm commit` for conventional commits.
- Avoid mixing business changes with structural refactors in the same change when they can be separated.
- Do not edit generated artifacts or build directories such as `dist/` and `node_modules/`.
- If a change touches HTTP, gRPC, and queues at the same time, validate the layer closest to the changed rule first before broadening the review.
