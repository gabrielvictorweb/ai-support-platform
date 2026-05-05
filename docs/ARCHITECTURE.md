# Architecture

This document describes the high-level architecture of the AI Support Platform.

---

## Overview

The system is designed as a microservices-based platform for customer support, with AI integration as a fallback when human agents are unavailable.

It follows a modular and scalable architecture where each service is responsible for a specific domain.

---

## High-Level Flow

```text
Client (Frontend)
        ↓
        BFF
        ↓
-----------------------------------
|   user-service                  |
|   agent-service                |
|   conversation-service         |
|   ai-gateway                   |
-----------------------------------
        ↓
 External AI Providers
```

---

## Core Components

### BFF (Backend for Frontend)

- Entry point for all client requests
- Aggregates data from multiple services
- Shapes responses for frontend needs
- Reduces number of client requests

The frontend communicates exclusively with the BFF.

---

### user-service

Responsible for:

- Authentication and authorization
- User management
- Access control

---

### agent-service

Responsible for:

- AI agent configuration
- Prompt management
- Agent behavior and rules

---

### conversation-service

Responsible for:

- Message handling
- Conversation history
- Session and context management

---

### ai-gateway

Responsible for:

- Communication with external AI providers
- Request orchestration
- Retry and fallback strategies
- Cost and usage control

---

## Communication

Services communicate via:

- HTTP REST (primary approach)

Future improvements may include:

- Message queues (e.g., asynchronous processing)
- Event-driven communication

---

## Technology Strategy

- Node.js (NestJS) for API-oriented services
- Python (FastAPI) for AI-related processing
- Docker for containerization
- pnpm for workspace and dependency management

---

## Data Flow Example

1. User sends a message via frontend
2. Request goes to BFF
3. BFF forwards to conversation-service
4. If no human agent is available:
    - BFF calls ai-gateway
    - ai-gateway processes request via AI provider

5. Response is returned to BFF
6. BFF returns formatted response to client

---

## Project Structure

```text
services/
  bff/
  user-service/
  agent-service/
  conversation-service/
  ai-gateway/

libs/
  shared utilities and types

load-tests/
  stress and performance tests

infra/
  docker and infrastructure configuration
```

---

## Design Principles

- Separation of concerns
- Independent deployability of services
- Clear domain boundaries
- Scalability and maintainability
- Explicit service communication

---

## Future Improvements

- Event-driven architecture
- Centralized logging and tracing
- Rate limiting and security layers
- Service discovery
- Observability (metrics and monitoring)
