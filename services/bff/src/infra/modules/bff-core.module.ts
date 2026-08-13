import { join } from 'node:path';
import { readFileSync } from 'node:fs';
import * as grpc from '@grpc/grpc-js';
import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { ClientsModule, Transport } from '@nestjs/microservices';
import type { AgentReadPort } from '../../application/ports/output/agent-read.port';
import type { ConversationReadPort } from '../../application/ports/output/conversation-read.port';
import type { UserReadPort } from '../../application/ports/output/user-read.port';
import type { MessageReadPort } from '../../application/ports/output/message-read.port';
import type { AgentChatPort } from '../../application/ports/output/agent-chat.port';
import { APP_TOKENS } from '../../application/tokens';
import { GetAgentsByConversationIdsUseCase } from '../../application/usecases/get-agents-by-conversation-ids.usecase';
import { GetConversationsByUserIdsUseCase } from '../../application/usecases/get-conversations-by-user-ids.usecase';
import { GetOrProvisionUserUseCase } from '../../application/usecases/get-or-provision-user.usecase';
import { ListUsersUseCase } from '../../application/usecases/list-users.usecase';
import { ListMessagesByConversationUseCase } from '../../application/usecases/list-messages-by-conversation.usecase';
import { SendMessageUseCase } from '../../application/usecases/send-message.usecase';
import { AskAgentUseCase } from '../../application/usecases/ask-agent.usecase';
import { AgentsGrpcClient } from '../../presentation/grpc/agents-grpc.client';
import { ConversationsGrpcClient } from '../../presentation/grpc/conversations-grpc.client';
import { UsersGrpcClient } from '../../presentation/grpc/users-grpc.client';
import { MessagesGrpcClient } from '../../presentation/grpc/messages-grpc.client';
import { AgentChatGrpcClient } from '../../presentation/grpc/agent-chat.client';
import { GraphqlAuthGuard } from '../graphql/auth/guards/graphql-auth.guard';
import { AgentsByConversationLoaderFactory } from '../graphql/loaders/agents-by-conversation.loader.factory';
import { ConversationsByUserLoaderFactory } from '../graphql/loaders/conversations-by-user.loader.factory';
import { ConversationsResolver } from '../../presentation/graphql/resolvers/conversations.resolver';
import { UsersResolver } from '../../presentation/graphql/resolvers/users.resolver';
import { MessagesResolver } from '../../presentation/graphql/resolvers/messages.resolver';
import { AgentsResolver } from '../../presentation/graphql/resolvers/agents.resolver';
import { AuthModule } from '../auth/auth.module';

function buildGrpcCredentials(): grpc.ChannelCredentials {
  const ca = process.env.GRPC_CA_CERT;
  const key = process.env.GRPC_CLIENT_KEY;
  const cert = process.env.GRPC_CLIENT_CERT;

  if (ca && key && cert) {
    return grpc.credentials.createSsl(
      readFileSync(ca),
      readFileSync(key),
      readFileSync(cert),
    );
  }

  return grpc.credentials.createInsecure();
}

const grpcCredentials = buildGrpcCredentials();

@Module({
  imports: [
    AuthModule,
    // registerAsync + ConfigService: as URLs são resolvidas em runtime, depois
    // que o ConfigModule carregou o .env. Com register() síncrono, as URLs eram
    // lidas de process.env na avaliação do módulo (antes do .env carregar),
    // caindo nos defaults — fazia o client de users apontar para a porta do
    // conversation-service (50051) e retornar UNIMPLEMENTED em CreateUser.
    ClientsModule.registerAsync([
      {
        name: 'USERS_GRPC_CLIENT',
        imports: [ConfigModule],
        inject: [ConfigService],
        useFactory: (config: ConfigService) => ({
          transport: Transport.GRPC,
          options: {
            package: 'users',
            protoPath: join(
              process.cwd(),
              'src/presentation/grpc/proto/users.proto',
            ),
            url: config.get<string>('USERS_GRPC_URL') ?? 'localhost:7000',
            credentials: grpcCredentials,
          },
        }),
      },
      {
        name: 'CONVERSATIONS_GRPC_CLIENT',
        imports: [ConfigModule],
        inject: [ConfigService],
        useFactory: (config: ConfigService) => ({
          transport: Transport.GRPC,
          options: {
            package: 'conversation',
            protoPath: join(
              process.cwd(),
              'src/presentation/grpc/proto/conversation.proto',
            ),
            url:
              config.get<string>('CONVERSATIONS_GRPC_URL') ??
              'localhost:50052',
            credentials: grpcCredentials,
          },
        }),
      },
      {
        name: 'AGENTS_GRPC_CLIENT',
        imports: [ConfigModule],
        inject: [ConfigService],
        useFactory: (config: ConfigService) => ({
          transport: Transport.GRPC,
          options: {
            package: 'agent',
            protoPath: join(
              process.cwd(),
              'src/presentation/grpc/proto/agents.proto',
            ),
            url: config.get<string>('AGENTS_GRPC_URL') ?? 'localhost:50053',
            credentials: grpcCredentials,
          },
        }),
      },
    ]),
  ],
  providers: [
    UsersGrpcClient,
    ConversationsGrpcClient,
    AgentsGrpcClient,
    MessagesGrpcClient,
    AgentChatGrpcClient,
    GraphqlAuthGuard,
    ConversationsByUserLoaderFactory,
    AgentsByConversationLoaderFactory,
    UsersResolver,
    ConversationsResolver,
    MessagesResolver,
    AgentsResolver,
    {
      provide: APP_TOKENS.USER_READ_PORT,
      useExisting: UsersGrpcClient,
    },
    {
      provide: APP_TOKENS.MESSAGE_READ_PORT,
      useExisting: MessagesGrpcClient,
    },
    {
      provide: APP_TOKENS.AGENT_CHAT_PORT,
      useExisting: AgentChatGrpcClient,
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
      provide: APP_TOKENS.GET_OR_PROVISION_USER_USE_CASE,
      useFactory: (userReadPort: UserReadPort, config: ConfigService) => {
        const supportEmails = (config.get<string>('SUPPORT_EMAILS') ?? '')
          .split(',')
          .map((email) => email.trim().toLowerCase())
          .filter(Boolean);
        return new GetOrProvisionUserUseCase(userReadPort, supportEmails);
      },
      inject: [APP_TOKENS.USER_READ_PORT, ConfigService],
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
    {
      provide: APP_TOKENS.LIST_MESSAGES_BY_CONVERSATION_USE_CASE,
      useFactory: (messageReadPort: MessageReadPort) =>
        new ListMessagesByConversationUseCase(messageReadPort),
      inject: [APP_TOKENS.MESSAGE_READ_PORT],
    },
    {
      provide: APP_TOKENS.SEND_MESSAGE_USE_CASE,
      useFactory: (messageReadPort: MessageReadPort) =>
        new SendMessageUseCase(messageReadPort),
      inject: [APP_TOKENS.MESSAGE_READ_PORT],
    },
    {
      provide: APP_TOKENS.ASK_AGENT_USE_CASE,
      useFactory: (agentChatPort: AgentChatPort) =>
        new AskAgentUseCase(agentChatPort),
      inject: [APP_TOKENS.AGENT_CHAT_PORT],
    },
  ],
  exports: [
    ConversationsByUserLoaderFactory,
    AgentsByConversationLoaderFactory,
  ],
})
export class BffCoreModule {}
