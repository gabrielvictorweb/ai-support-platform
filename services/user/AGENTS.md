# AGENTS.md

## Objetivo do projeto

Aplicação Spring Boot para gerenciamento de usuários do closed chat via gRPC, com persistência em PostgreSQL (JPA/Hibernate) e observabilidade via métricas Prometheus.

## Arquitetura adotada

Estrutura em camadas com inversão de dependência:

- `domain`: regras e modelos de negócio puros.
- `application/gateways`: contratos (interfaces) que a aplicação usa para acessar persistência.
- `application/usecases`: casos de uso que orquestram regras de negócio e dependem dos gateways.
- `infra/repositories`: implementações concretas de persistência (JPA/PostgreSQL), implementando interfaces de `application/gateways`.
- `infra/controller`: componentes adaptadores internos que recebem dados de entrada e chamam use cases.
- `infra/grpc`: serviço gRPC, mapeadores e tratamento de exceções do transporte gRPC.

## Regras de implementação

1. Use case não depende de framework de persistência.
2. Repositórios em `infra/repositories` implementam interfaces de `application/gateways`.
3. Adapter (controller interno ou gRPC service) chama use case; não acessa JPA diretamente.
4. Entidade de banco deve refletir constraints obrigatórias (ex.: email único).
5. Alterações de configuração ficam em `src/main/resources/application.properties`.

## Convenções de usuário (CRUD)

- Campos obrigatórios: `name`, `email`, `phone`.
- `email` é único.
- Operações expostas via serviço gRPC `users.UserService`.
- `id` do usuário deve ser UUID em todo o sistema (domínio, persistência e contrato gRPC).

## Métricas

- Endpoint de scrape Prometheus: `/metrics`.
- Métricas customizadas podem ser registradas com Micrometer no controller ou em componentes dedicados.

## Contrato gRPC

- Definição protobuf: `src/main/proto/user_service.proto`.
- Porta padrão gRPC: `9090` (configurada em `grpc.server.port`).
- IDs no proto são serializados como `string` em formato UUID.

## Execução local

- Dependências: Java 25 e Maven Wrapper (`./mvnw`).
- Configure conexão com banco via `DB_URL`, `DB_USERNAME`, `DB_PASSWORD` (ou `application-local.properties` local).
- Subir aplicação: `./mvnw spring-boot:run`.
- Rodar testes unitários: `./mvnw test`.
