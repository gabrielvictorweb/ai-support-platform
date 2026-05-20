import { join } from 'node:path';
import { Module } from '@nestjs/common';
import { GraphQLModule } from '@nestjs/graphql';
import { ApolloDriver, ApolloDriverConfig } from '@nestjs/apollo';
import type { Request } from 'express';
import { BffCoreModule } from './infra/modules/bff-core.module';
import { HealthModule } from './infra/modules/health.module';
import { MetricsModule } from './infra/modules/metrics.module';
import { AgentsByConversationLoaderFactory } from './infra/graphql/loaders/agents-by-conversation.loader.factory';
import { ConversationsByUserLoaderFactory } from './infra/graphql/loaders/conversations-by-user.loader.factory';
import type { GraphqlContext } from './presentation/graphql/context/graphql-context.types';
import { ConfigModule } from '@nestjs/config';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    BffCoreModule,
    HealthModule,
    MetricsModule,
    GraphQLModule.forRootAsync<ApolloDriverConfig>({
      driver: ApolloDriver,
      imports: [BffCoreModule],
      inject: [
        ConversationsByUserLoaderFactory,
        AgentsByConversationLoaderFactory,
      ],
      useFactory: (
        conversationsByUserLoaderFactory: ConversationsByUserLoaderFactory,
        agentsByConversationLoaderFactory: AgentsByConversationLoaderFactory,
      ): ApolloDriverConfig => ({
        autoSchemaFile: join(process.cwd(), 'src/schema.gql'),
        context: ({ req }: { req: Request }): GraphqlContext => {
          const authHeader = req.headers['authorization'];
          const token =
            typeof authHeader === 'string' && authHeader.startsWith('Bearer ')
              ? authHeader.slice(7)
              : undefined;

          return {
            token,
            user: undefined,
            loaders: {
              conversationsByUserId: conversationsByUserLoaderFactory.create(),
              agentsByConversationId:
                agentsByConversationLoaderFactory.create(),
            },
          };
        },
      }),
    }),
  ],
})
export class AppModule {}
