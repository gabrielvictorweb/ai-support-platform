# Infrastructure

## Postgres via Docker

Before starting local services, you must start the Postgres container via Docker. This ensures services that depend on the database can boot correctly.

### Steps

1. Enter the Postgres compose directory:

   ```bash
   cd infra/docker/postgres
   ```

2. Start the container:

   ```bash
   docker compose up -d
   ```

3. Check container health:

   ```bash
   docker compose ps
   ```

### Notes

- Start Postgres before running local services.
- To stop the container: `docker compose down`.
