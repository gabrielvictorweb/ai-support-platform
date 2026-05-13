# User Service

Spring Boot application for user management with layered architecture, gRPC communication, JPA/PostgreSQL persistence, and Prometheus observability.

## Overview

The application exposes user CRUD operations over gRPC (`users.UserService`) and applies business rules in the `application` layer without direct coupling to infrastructure details.

Core domain rules:

- required fields: `name`, `email`, `phone`
- unique `email`
- user `id` is UUID

## Architecture

Layered structure with dependency inversion:

- `domain`: pure entities and rules (`User`)
- `application/gateways`: persistence contracts
- `application/usecases`: business rule orchestration
- `infra/repositories`: JPA implementations of gateways
- `infra/controller`: internal adapters for input/output
- `infra/grpc`: gRPC transport (service, mapper, exception handling)

## Technical Decisions

- **gRPC instead of REST**: typed Protobuf contract for service-to-service integration.
- **UUID as ID**: avoids predictable sequential IDs.
- **JPA + PostgreSQL**: relational persistence with constraints (unique `email`).
- **Decoupled use cases**: business rules depend on interfaces (`UserGateway`), not framework.
- **Micrometer + Prometheus**: metrics at `/metrics`.
- **Unit tests with Mockito**: coverage for use cases and controllers.

## Technologies

- Java 25
- Spring Boot 4.0.5
- Spring Data JPA
- PostgreSQL
- gRPC (`grpc-server-spring-boot-starter`)
- Protobuf (`protobuf-maven-plugin`)
- Flyway
- Micrometer Prometheus
- JUnit 5 + Mockito

## Configuration

Supported environment variables:

- `DB_URL`
- `DB_USERNAME`
- `DB_PASSWORD`

Example (Linux/macOS):

```bash
export DB_URL='jdbc:postgresql://localhost:5433/user_db'
export DB_USERNAME='admin'
export DB_PASSWORD='admin'
```

## How to run the application

```bash
cd services/user
./mvnw spring-boot:run
```

Ports and endpoints:

- HTTP: `http://localhost:8080`
- Prometheus metrics: `http://localhost:8080/metrics`
- gRPC server: port `7000`

## How to run unit tests

```bash
./mvnw test
```

## gRPC Contract

Proto file:

- `src/main/proto/user_service.proto`

Exposed service:

- `users.UserService`

Methods:

- `FindAllUsers`
- `FindUserById`
- `FindUserByEmail`
- `CreateUser`
- `UpdateUser`
- `DeleteUser`

Note: `id` fields are transferred as `string` in UUID format.

## Database migrations

Schema migrations are managed by Flyway. The migration file is at:

- `src/main/resources/db/migration/V1__users_id_to_uuid.sql`

### Local development

Flyway runs automatically on application startup via Spring Boot autoconfiguration.

### Docker

Due to a known issue with Flyway autoconfiguration in Spring Boot 4.0.x, migrations may not run automatically inside Docker. If the container exits with a schema validation error, apply the migration manually before restarting:

```bash
docker exec -i postgres-user-db-1 psql -U admin -d user_db \
  < services/user/src/main/resources/db/migration/V1__users_id_to_uuid.sql
docker compose up -d --force-recreate user
```

Alternatively, run the migration via the Flyway Maven plugin:

```bash
./mvnw flyway:migrate \
  -Dflyway.url=jdbc:postgresql://localhost:5433/user_db \
  -Dflyway.user=admin \
  -Dflyway.password=admin
```
