# Users Closed Chat

Aplicação Spring Boot para gerenciamento de usuários do closed chat com arquitetura em camadas, comunicação via gRPC, persistência com JPA/PostgreSQL e observabilidade com Prometheus.

## Visão geral

A aplicação expõe operações de CRUD de usuários através de gRPC (`users.UserService`) e aplica regras de negócio no `application` sem acoplamento direto com detalhes de infraestrutura.

Regras de domínio principais:

- campos obrigatórios: `name`, `email`, `phone`
- `email` único
- `id` do usuário em UUID

## Arquitetura

Estrutura baseada em camadas e inversão de dependência:

- `domain`: entidades e regras puras (`User`)
- `application/gateways`: contratos de persistência
- `application/usecases`: orquestração das regras de negócio
- `infra/repositories`: implementação JPA dos gateways
- `infra/controller`: adapters internos para entrada/saída de dados
- `infra/grpc`: transporte gRPC (service, mapper e tratamento de exceções)

## Decisões técnicas

- **gRPC em vez de GraphQL**: contrato explícito e tipado com Protobuf, facilitando evolução e geração de stubs.
- **UUID como ID**: evita previsibilidade de IDs sequenciais e melhora segurança em integrações externas.
- **JPA + PostgreSQL**: persistência relacional com constraints (`email` único) e mapeamento simples.
- **Use cases desacoplados**: regras de negócio dependem de interfaces (`UserGateway`), não de framework.
- **Micrometer + Prometheus**: métricas publicadas no endpoint `/metrics`.
- **Testes unitários com Mockito**: cobertura de use cases e controllers com mocks para feedback rápido.

## Tecnologias

- Java 25
- Spring Boot 4.0.5
- Spring Data JPA
- PostgreSQL
- gRPC (`grpc-server-spring-boot-starter`)
- Protobuf (`protobuf-maven-plugin`)
- Flyway
- Micrometer Prometheus
- JUnit 5 + Mockito

## Configuração

A aplicação lê variáveis de ambiente e também importa opcionalmente `application-local.properties`.

Variáveis suportadas:

- `DB_URL`
- `DB_USERNAME`
- `DB_PASSWORD`

Configuração JPA em runtime:

- `spring.jpa.hibernate.ddl-auto=validate` (não altera schema automaticamente em produção/local)
- `spring.flyway.enabled=true` (migração versionada antes da validação do Hibernate)

Exemplo (Linux/macOS):

```bash
export DB_URL='jdbc:postgresql://localhost:5432/users'
export DB_USERNAME='postgres'
export DB_PASSWORD='postgres'
```

## Como executar a aplicação

```bash
./mvnw spring-boot:run
```

Portas e endpoints:

- gRPC server: `9090`
- métricas Prometheus: `http://localhost:8080/metrics`

## Como executar os testes unitários

```bash
./mvnw test
```

Os testes cobrem:

- `application/usecases` com `UserGateway` mockado
- `infra/controller` com use cases mockados

## Contrato gRPC

Arquivo proto:

- `src/main/proto/user_service.proto`

Serviço exposto:

- `users.UserService`

Métodos:

- `FindAllUsers`
- `FindUserById`
- `FindUserByEmail`
- `CreateUser`
- `UpdateUser`
- `DeleteUser`

Observação:

- os campos `id` trafegam como `string` em formato UUID no contrato gRPC.

## Migração de banco (BIGINT -> UUID)

Se sua base já existia antes da mudança para UUID, pode ocorrer erro como:

- `java.lang.ClassCastException: Cannot cast java.lang.Long to java.util.UUID`

Isso significa que a coluna `users.id` no PostgreSQL ainda está em `BIGINT`.

Também pode aparecer durante startup com mensagem semelhante a:

- `alter column id set data type uuid ... identity column type must be smallint, integer, or bigint`

Esse erro ocorre quando o Hibernate tenta fazer auto-migração de uma coluna `IDENTITY` numérica para UUID.

### Opção 1 (recomendada para base existente)

Ao subir a aplicação, o Flyway executa automaticamente a migração versionada em:

- `src/main/resources/db/migration/V1__users_id_to_uuid.sql`

Se quiser executar manualmente o script equivalente:

```bash
psql "postgresql://USER:PASSWORD@HOST:5432/DBNAME?sslmode=require" -f scripts/migrate_users_id_to_uuid.sql
```

Se preferir executar pelo Flyway Maven plugin (o plugin nao le o application.properties automaticamente), use:

```bash
./mvnw flyway:migrate \
 -Dflyway.url=jdbc:postgresql://localhost:5433/user_db \
 -Dflyway.user=admin \
 -Dflyway.password=admin
```

Se você usa `DB_URL` no formato JDBC (`jdbc:postgresql://...`), converta para o formato aceito pelo `psql` (`postgresql://...`).

O script está em:

- `scripts/migrate_users_id_to_uuid.sql`

Ordem recomendada:

1. pare a aplicação
2. execute o script SQL
3. suba a aplicação novamente

### Opção 2 (ambiente local sem necessidade de preservar dados)

Remova a tabela e deixe o Hibernate recriar:

```sql
DROP TABLE IF EXISTS users;
```

Depois reinicie a aplicação.
