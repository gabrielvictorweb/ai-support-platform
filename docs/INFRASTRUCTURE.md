# Infraestrutura

## Postgres via Docker

Antes de iniciar os servicos locais, e necessario subir o container do Postgres via Docker. Isso garante que os servicos que dependem do banco possam iniciar corretamente.

### Passos

1. Entre no diretorio do compose do Postgres:

   ```bash
   cd infra/docker/postgres
   ```

2. Suba o container:

   ```bash
   docker compose up -d
   ```

3. Verifique se o container esta saudavel:

   ```bash
   docker compose ps
   ```

### Observacoes

- Suba o Postgres antes de rodar os servicos locais.
- Para parar o container: `docker compose down`.
