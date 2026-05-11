# Users Closed Chat

Spring Boot application for closed chat user management with layered architecture, gRPC communication, JPA/PostgreSQL persistence, and Prometheus observability.

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

- **gRPC instead of GraphQL**: explicit, typed contract with Protobuf for easier evolution and stub generation.
- **UUID as ID**: avoids predictable sequential IDs and improves external integration safety.
- **JPA + PostgreSQL**: relational persistence with constraints (unique `email`) and simple mapping.
- **Decoupled use cases**: business rules depend on interfaces (`UserGateway`), not framework.
- **Micrometer + Prometheus**: metrics published at the `/metrics` endpoint.
- **Unit tests with Mockito**: coverage for use cases and controllers with mocks for fast feedback.

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

The application reads environment variables and can optionally import `application-local.properties`.

Supported variables:

- `DB_URL`
- `DB_USERNAME`
- `DB_PASSWORD`

Runtime JPA configuration:

- `spring.jpa.hibernate.ddl-auto=validate` (does not change schema automatically in production/local)
- `spring.flyway.enabled=true` (versioned migration before Hibernate validation)

Example (Linux/macOS):

```bash
export DB_URL='jdbc:postgresql://localhost:5432/users'
export DB_USERNAME='postgres'
export DB_PASSWORD='postgres'
```

## How to run the application

```bash
./mvnw spring-boot:run
```

Ports and endpoints:

- gRPC server: `9090`
- Prometheus metrics: `http://localhost:8080/metrics`

## How to run unit tests

```bash
./mvnw test
```

Tests cover:

- `application/usecases` with mocked `UserGateway`
- `infra/controller` with mocked use cases

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

Note:

- `id` fields are transferred as `string` in UUID format in the gRPC contract.

## Database Migration (BIGINT -> UUID)

If your database existed before the UUID change, you may see errors such as:

- `java.lang.ClassCastException: Cannot cast java.lang.Long to java.util.UUID`

This means the `users.id` column in PostgreSQL is still `BIGINT`.

You might also see during startup:

- `alter column id set data type uuid ... identity column type must be smallint, integer, or bigint`

This happens when Hibernate tries to auto-migrate a numeric `IDENTITY` column to UUID.

### Option 1 (recommended for existing databases)

When the app starts, Flyway automatically runs the versioned migration at:

- `src/main/resources/db/migration/V1__users_id_to_uuid.sql`

If you want to run the equivalent script manually:

```bash
psql "postgresql://USER:PASSWORD@HOST:5432/DBNAME?sslmode=require" -f scripts/migrate_users_id_to_uuid.sql
```

If you prefer to run via the Flyway Maven plugin (the plugin does not read application.properties automatically), use:

```bash
./mvnw flyway:migrate \
 -Dflyway.url=jdbc:postgresql://localhost:5433/user_db \
 -Dflyway.user=admin \
 -Dflyway.password=admin
```

If you use `DB_URL` in JDBC format (`jdbc:postgresql://...`), convert it to the format accepted by `psql` (`postgresql://...`).

The script is located at:

- `scripts/migrate_users_id_to_uuid.sql`

Recommended order:

1. stop the application
2. run the SQL script
3. start the application again

### Option 2 (local environment without data preservation)

Drop the table and let Hibernate recreate it:

```sql
DROP TABLE IF EXISTS users;
```

Then restart the application.
