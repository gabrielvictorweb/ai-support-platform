import { join } from 'node:path';
import { Module } from '@nestjs/common';
import { ClientsModule, Transport } from '@nestjs/microservices';
import type { AgentReadPort } from '../../application/ports/output/agent-read.port';
import type { ConversationReadPort } from '../../application/ports/output/conversation-read.port';
import type { UserReadPort } from '../../application/ports/output/user-read.port';
import { APP_TOKENS } from '../../application/tokens';
import { GetAgentsByConversationIdsUseCase } from '../../application/usecases/get-agents-by-conversation-ids.usecase';
import { GetConversationsByUserIdsUseCase } from '../../application/usecases/get-conversations-by-user-ids.usecase';
import { GetCurrentUserUseCase } from '../../application/usecases/get-current-user.usecase';
import { ListUsersUseCase } from '../../application/usecases/list-users.usecase';
import { AgentsGrpcClient } from '../../presentation/grpc/agents-grpc.client';
import { ConversationsGrpcClient } from '../../presentation/grpc/conversations-grpc.client';
import { UsersGrpcClient } from '../../presentation/grpc/users-grpc.client';
import { GraphqlAuthGuard } from '../graphql/auth/guards/graphql-auth.guard';
import { AgentsByConversationLoaderFactory } from '../graphql/loaders/agents-by-conversation.loader.factory';
import { ConversationsByUserLoaderFactory } from '../graphql/loaders/conversations-by-user.loader.factory';
import { ConversationsResolver } from '../../presentation/graphql/resolvers/conversations.resolver';
import { UsersResolver } from '../../presentation/graphql/resolvers/users.resolver';

@Module({
  imports: [
    ClientsModule.register([
      {
        name: 'USERS_GRPC_CLIENT',
        transport: Transport.GRPC,
        options: {
          package: 'users',
          protoPath: join(
            process.cwd(),
            'src/presentation/grpc/proto/users.proto',
          ),
          url: process.env.USERS_GRPC_URL ?? 'localhost:50051',
        },
      },
      {
        name: 'CONVERSATIONS_GRPC_CLIENT',
        transport: Transport.GRPC,
        options: {
          package: 'conversation',
          protoPath: join(
            process.cwd(),
            'src/presentation/grpc/proto/conversation.proto',
          ),
          url: process.env.CONVERSATIONS_GRPC_URL ?? 'localhost:50052',
        },
      },
    ]),
  ],
  providers: [
    UsersGrpcClient,
    ConversationsGrpcClient,
    AgentsGrpcClient,
    GraphqlAuthGuard,
    ConversationsByUserLoaderFactory,
    AgentsByConversationLoaderFactory,
    UsersResolver,
    ConversationsResolver,
    {
      provide: APP_TOKENS.USER_READ_PORT,
      useExisting: UsersGrpcClient,
    },
    {
      provide: APP_TOKENS.CONVERSATION_READ_PORT,
      useExisting: ConversationsGrpcClient,
    },
    {
      provide: APP_TOKENS.AGENT_READ_PORT,
      useExisting: AgentsGrpcClient,
    },
    {
      provide: APP_TOKENS.GET_CURRENT_USER_USE_CASE,
      useFactory: (userReadPort: UserReadPort) =>
        new GetCurrentUserUseCase(userReadPort),
      inject: [APP_TOKENS.USER_READ_PORT],
    },
    {
      provide: APP_TOKENS.LIST_USERS_USE_CASE,
      useFactory: (userReadPort: UserReadPort) =>
        new ListUsersUseCase(userReadPort),
      inject: [APP_TOKENS.USER_READ_PORT],
    },
    {
      provide: APP_TOKENS.GET_CONVERSATIONS_BY_USER_IDS_USE_CASE,
      useFactory: (conversationReadPort: ConversationReadPort) =>
        new GetConversationsByUserIdsUseCase(conversationReadPort),
      inject: [APP_TOKENS.CONVERSATION_READ_PORT],
    },
    {
      provide: APP_TOKENS.GET_AGENTS_BY_CONVERSATION_IDS_USE_CASE,
      useFactory: (agentReadPort: AgentReadPort) =>
        new GetAgentsByConversationIdsUseCase(agentReadPort),
      inject: [APP_TOKENS.AGENT_READ_PORT],
    },
  ],
  exports: [
    ConversationsByUserLoaderFactory,
    AgentsByConversationLoaderFactory,
  ],
})
export class BffCoreModule {}
