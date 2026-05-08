# Project Overview for Agent

This document summarizes the architecture and structure of this NestJS project so an agent (like GitHub Copilot) can understand the layout before making changes.

## High-Level Architecture

The project follows a clean / hexagonal style architecture:

- **domain**: Core entities and repository contracts (business rules, no NestJS).
- **application**: Use cases (services) that orchestrate domain logic and depend on repository interfaces.
- **infra**: Adapters for infrastructure concerns (database via Prisma, Nest modules, repositories, metrics, health, etc.).
- **interface**: Adapters for input/output (GraphQL resolvers, controllers, DTOs).
- **test**: Unit, e2e and stress/load tests (K6).

The main feature is a closed-chat conversation domain with `Conversation` and `Message` entities, exposed via GraphQL.

## Directory Tree (Simplified)

```text
.
├─ README.md
├─ COPILOT.md              # This file (project map for agents)
├─ package.json
├─ pnpm-lock.yaml
├─ tsconfig.json
├─ tsconfig.build.json
├─ nest-cli.json
├─ eslint.config.mjs
├─ .env / .env.example
├─ prisma.config.ts        # Prisma/Nest integration config
├─ dist/                   # Build output (ignored for edits)
├─ node_modules/           # Dependencies (do not edit)
├─ src/
│  ├─ main.ts              # Nest bootstrap
│  ├─ app.module.ts        # Root Nest module wiring infra/interface
│  ├─ graphql.ts           # Generated GraphQL types/interfaces
│  ├─ schema.gql           # Generated GraphQL schema
│  ├─ domain/
│  │  ├─ entities/
│  │  │  ├─ conversation.entity.ts  # Conversation domain model
│  │  │  └─ message.entity.ts       # Message domain model
│  │  └─ interfaces/
│  │     ├─ conversation.repository.ts  # IConversationRepository contract
│  │     └─ message.repository.ts       # IMessageRepository contract
│  ├─ application/
│  │  └─ usecases/
│  │     ├─ create-conversation.usecase.ts
│  │     ├─ get-conversation.usecase.ts
│  │     ├─ list-conversations.usecase.ts
│  │     ├─ update-conversation.usecase.ts
│  │     ├─ delete-conversation.usecase.ts
│  │     ├─ create-message.usecase.ts
│  │     ├─ get-message.usecase.ts
│  │     ├─ list-messages.usecase.ts
│  │     ├─ list-messages-by-conversation.usecase.ts
│  │     └─ delete-message.usecase.ts
│  ├─ infra/
│  │  ├─ prisma/
│  │  │  └─ prisma.service.ts      # PrismaClient wrapper (Nest provider)
│  │  ├─ repositories/
│  │  │  ├─ conversation.repository.ts  # Prisma-based Conversation repo
│  │  │  └─ message.repository.ts       # Prisma-based Message repo
│  │  ├─ modules/
│  │  │  ├─ prisma.module.ts       # Global module exporting PrismaService
│  │  │  ├─ conversation.module.ts # Wires repos, usecases, resolvers
│  │  │  ├─ graphql.module.ts      # GraphQL/Apollo setup
│  │  │  ├─ health.module.ts       # Health checks HTTP endpoint
│  │  │  └─ metrics.module.ts      # Prometheus metrics module
│  │  └─ database/
│  │     ├─ generated/             # Prisma generated artifacts (do not edit)
│  │     └─ prisma/
│  │        └─ models/
│  │           └─ participants.prisma (and related models if present)
│  ├─ interface/
│  │  ├─ controllers/
│  │  │  └─ health.controller.ts   # Health HTTP controller
│  │  ├─ resolvers/
│  │  │  ├─ conversation.resolver.ts  # GraphQL Conversation resolver
│  │  │  └─ message.resolver.ts       # GraphQL Message resolver
│  │  └─ dtos/
│  │     ├─ create-conversation.dto.ts
│  │     ├─ update-conversation.dto.ts
│  │     ├─ create-message.dto.ts
│  │     └─ update-message.dto.ts
├─ prisma/
│  └─ schema.prisma           # Prisma schema for Conversation/Message
└─ test/
   ├─ app.e2e-spec.ts         # Basic e2e test (Nest + HTTP)
   ├─ jest-e2e.json           # Jest e2e config
   ├─ stress/
   │  ├─ flow-create-conversation-and-message.ts
   │  ├─ flow-edit-conversation.ts
   │  ├─ flow-multiple-conversations.ts
   │  └─ flow-multiple-messages.ts
   │       # K6 scripts hitting GraphQL API with FakerJS data
   └─ unit/
      ├─ domain/              # Entity unit tests
      ├─ application/         # Use case unit tests
      └─ interface/           # Resolver/controller unit tests
```

> Note: Some subfolders/files inside `domain`, `application`, `interface`, and `test/unit` are summarized above by pattern; agents should inspect them as needed.

## Key Concepts for Agents

- **Repositories and Prisma**
    - Domain contracts live in `src/domain/interfaces/*repository.ts`.
    - Concrete implementations using Prisma live in `src/infra/repositories/` and depend on `PrismaService` from `src/infra/prisma/prisma.service.ts`.
    - `PrismaModule` in `src/infra/modules/prisma.module.ts` is `@Global()` and exports `PrismaService`.

- **Dependency Injection Tokens**
    - Use cases in `src/application/usecases` depend on repository interfaces, wired via Nest providers in `src/infra/modules/conversation.module.ts` using tokens like `"IConversationRepository"` and `"IMessageRepository"`.

- **GraphQL Layer**
    - Resolvers in `src/interface/resolvers` call use cases.
    - GraphQL schema and types are generated into `src/schema.gql` and `src/graphql.ts`.

- **HTTP/Health/Metrics**
    - Health controller under `src/interface/controllers/health.controller.ts` and its module in `src/infra/modules/health.module.ts`.
    - Metrics via `src/infra/modules/metrics.module.ts` (Prometheus integration).

- **Testing Strategy**
    - Unit tests live under `test/unit` for entities, usecases, controllers/resolvers.
    - E2E test in `test/app.e2e-spec.ts`.
    - Load/stress tests with K6 live in `test/stress`, using FakerJS and GraphQL operations to simulate realistic chat flows.

## Guidelines for Automated Changes

- Prefer modifying **application** and **domain** for business rules, keeping them free of NestJS / transport details.
- Prefer modifying **infra** for persistence, metrics, and module wiring.
- Prefer modifying **interface** for GraphQL schemas, controllers, and DTOs.
- When changing persistence shape, update both Prisma schema (`prisma/schema.prisma`) and the corresponding repositories in `src/infra/repositories`.
- Keep tests updated: adjust `test/unit` and `test/stress` when behavior or contracts change.
