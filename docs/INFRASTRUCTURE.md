# Infrastructure

All infrastructure components run in Docker and must join the shared `ai-support` network so that application services and exporters can resolve each other by container name.

---

## Shared network

Create the network once before starting anything:

```bash
docker network create ai-support
```

---

## Infrastructure services

Each component has its own compose file under `infra/docker/`. Start them all before running the application:

```bash
docker compose -f infra/docker/postgres/docker-compose.yml up -d
docker compose -f infra/docker/rabbitmq/docker-compose.yml up -d
docker compose -f infra/docker/redis/docker-compose.yml up -d
docker compose -f infra/docker/mongodb/docker-compose.yml up -d
```

| Component | Container | Host port |
|---|---|---|
| PostgreSQL (user-db) | `postgres-user-db-1` | 5433 |
| PostgreSQL (conversation-db) | `postgres-conversation-db-1` | 5432 |
| RabbitMQ | `ai-support-rabbitmq` | 5672, 15672, 15692 |
| Redis | `ai-support-redis` | 6379 |
| MongoDB | `ai-support-mongodb` | 27017 |

RabbitMQ exposes Prometheus metrics natively on port `15692` via the `rabbitmq_prometheus` plugin (already enabled in the compose file).

---

## Application services

The root `docker-compose.yml` builds and runs all four application services:

```bash
docker compose up -d
```

| Service | Container | Host ports |
|---|---|---|
| BFF | `ai-support-bff` | 3000 (HTTP/GraphQL) |
| Conversation | `ai-support-conversation` | 3002 → internal 3000 |
| User | `ai-support-user` | 8080 (HTTP), 7000 (gRPC) |
| Agent | `ai-support-agent` | 8000 (HTTP), 50053 (gRPC) |

The conversation service runs Prisma migrations automatically on startup.

### User service — first run

The user service uses Flyway for schema migrations. Due to a known issue with Flyway autoconfiguration in Spring Boot 4.0.x, migrations may not run automatically inside Docker. If the container exits with a schema validation error, apply the migration manually:

```bash
docker exec -i postgres-user-db-1 psql -U admin -d user_db \
  < services/user/src/main/resources/db/migration/V1__users_id_to_uuid.sql
docker compose up -d --force-recreate user
```

---

## Observability stack

The observability stack runs from `infra/observability/docker-compose.yml` and must be started after the shared network exists:

```bash
docker compose -f infra/observability/docker-compose.yml up -d
```

| Component | Container | Host port | Role |
|---|---|---|---|
| Prometheus | `ai-support-prometheus` | 9091 | Metrics scraping |
| Grafana | `ai-support-grafana` | 3001 | Dashboards |
| Loki | `ai-support-loki` | 3102 | Log storage |
| Promtail | `ai-support-promtail` | — | Log collection from Docker socket |
| postgres-exporter (user-db) | `ai-support-postgres-exporter-user` | 9187 | PostgreSQL metrics |
| postgres-exporter (conversation-db) | `ai-support-postgres-exporter-conversation` | 9188 | PostgreSQL metrics |
| MongoDB exporter | `ai-support-mongodb-exporter` | 9216 | MongoDB metrics |
| Redis exporter | `ai-support-redis-exporter` | 9121 | Redis metrics |

Grafana starts fully pre-configured: Prometheus and Loki datasources are provisioned automatically, along with dashboards for Node.js, Spring Boot, Python, PostgreSQL, MongoDB, Redis, and RabbitMQ.

Access:

- Grafana: http://localhost:3001 (admin / admin)
- Prometheus: http://localhost:9091
- Prometheus targets: http://localhost:9091/targets

### Filtering logs by service in Grafana

Open Explore → Loki and query by container name:

```logql
{container="ai-support-conversation"}
{container="ai-support-bff"}
{container="ai-support-user"}
{container="ai-support-agent"}
```

---

## Metrics endpoints

Each application service exposes a `/metrics` endpoint in Prometheus text format:

| Service | URL |
|---|---|
| BFF | http://localhost:3000/metrics |
| Conversation | http://localhost:3002/metrics |
| User | http://localhost:8080/metrics |
| Agent | http://localhost:8000/metrics |

---

## mTLS certificates

Service-to-service gRPC communication is secured with mutual TLS in containerized environments. A script generates all required certificates:

```bash
bash infra/certs/gen-certs.sh
```

This creates the following files under `infra/certs/`:

| File | Purpose |
|---|---|
| `ca.crt` / `ca.key` | Internal CA |
| `bff-client.crt` / `bff-client.key` | BFF client certificate |
| `user-server.crt` / `user-server.key` | User service server certificate |
| `conversation-server.crt` / `conversation-server.key` | Conversation service server certificate |
| `agent-server.crt` / `agent-server.key` | Agent service server certificate |

The `infra/certs/` directory is added to `.gitignore`. In production, use a secrets manager (Vault, AWS ACM, etc.).

### Local development (without Docker)

TLS is disabled by default when cert env vars are absent. To enable it locally, generate the certs and set:

**BFF** (`services/bff/.env`):

```
GRPC_CA_CERT=../../infra/certs/ca.crt
GRPC_CLIENT_KEY=../../infra/certs/bff-client.key
GRPC_CLIENT_CERT=../../infra/certs/bff-client.crt
```

**User service** (`services/user/src/main/resources/application-local.properties`):

```properties
GRPC_TLS_ENABLED=true
GRPC_CA_CERT=../../infra/certs/ca.crt
GRPC_SERVER_KEY=../../infra/certs/user-server.key
GRPC_SERVER_CERT=../../infra/certs/user-server.crt
```

**Conversation and Agent services** — set the equivalent `GRPC_CA_CERT`, `GRPC_SERVER_KEY`, and `GRPC_SERVER_CERT` env vars pointing to their respective cert files.

### Docker

The root `docker-compose.yml` mounts `./infra/certs` as a read-only volume in each service and sets the env vars automatically. Run `gen-certs.sh` once before `docker compose up`.

---

## Full startup order

```bash
# 1. shared network
docker network create ai-support

# 2. infrastructure
docker compose -f infra/docker/postgres/docker-compose.yml up -d
docker compose -f infra/docker/rabbitmq/docker-compose.yml up -d
docker compose -f infra/docker/redis/docker-compose.yml up -d
docker compose -f infra/docker/mongodb/docker-compose.yml up -d

# 3. application services
docker compose up -d

# 4. observability
docker compose -f infra/observability/docker-compose.yml up -d
```
