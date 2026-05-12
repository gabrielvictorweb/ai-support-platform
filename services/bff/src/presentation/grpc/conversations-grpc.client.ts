import { Inject, Injectable, Logger, OnModuleInit } from '@nestjs/common';
import type { ClientGrpc } from '@nestjs/microservices';
import { firstValueFrom, Observable } from 'rxjs';
import { ConversationReadPort } from '../../application/ports/output/conversation-read.port';
import {
  type ConversationOutput,
  toConversationOutput,
} from '../../application/dtos';

const NOW = new Date();
const CONVERSATIONS = [
  {
    id: 'c1',
    participantIds: ['u1'],
    createdAt: NOW,
    updatedAt: NOW,
  },
  {
    id: 'c2',
    participantIds: ['u1'],
    createdAt: NOW,
    updatedAt: NOW,
  },
  {
    id: 'c3',
    participantIds: ['u2'],
    createdAt: NOW,
    updatedAt: NOW,
  },
];

interface ConversationMessage {
  id: string;
  participantIds?: string[];
  createdAt?: string;
  updatedAt?: string;
}

interface ListConversationsResponse {
  items: ConversationMessage[];
}

interface ConversationServiceClient {
  listConversations(request: object): Observable<ListConversationsResponse>;
}

@Injectable()
export class ConversationsGrpcClient
  implements ConversationReadPort, OnModuleInit
{
  private readonly logger = new Logger(ConversationsGrpcClient.name);
  private conversationService?: ConversationServiceClient;

  constructor(
    @Inject('CONVERSATIONS_GRPC_CLIENT')
    private readonly grpcClient: ClientGrpc,
  ) {}

  onModuleInit(): void {
    this.conversationService =
      this.grpcClient.getService<ConversationServiceClient>(
        'ConversationService',
      );
  }

  async findByUserIds(
    userIds: string[],
  ): Promise<Map<string, ConversationOutput[]>> {
    const userIdSet = new Set(userIds);
    const result = new Map<string, ConversationOutput[]>();

    for (const userId of userIds) {
      result.set(userId, []);
    }

    if (!this.conversationService) {
      this.logger.warn('Conversation Service unavailable, using fallback data');
      for (const conversation of CONVERSATIONS) {
        for (const participantId of conversation.participantIds) {
          if (!userIdSet.has(participantId)) {
            continue;
          }

          const userConversations = result.get(participantId);
          if (userConversations) {
            userConversations.push(toConversationOutput(conversation));
          }
        }
      }

      return result;
    }

    try {
      const response = await firstValueFrom(
        this.conversationService.listConversations({}),
      );

      for (const conversation of response.items ?? []) {
        const participantIds = conversation.participantIds ?? [];

        for (const participantId of participantIds) {
          if (!userIdSet.has(participantId)) {
            continue;
          }

          const userConversations = result.get(participantId);
          if (userConversations) {
            const createdAt = conversation.createdAt
              ? new Date(conversation.createdAt)
              : NOW;
            const updatedAt = conversation.updatedAt
              ? new Date(conversation.updatedAt)
              : createdAt;

            userConversations.push(
              toConversationOutput({
                id: conversation.id,
                participantIds,
                createdAt,
                updatedAt,
              }),
            );
          }
        }
      }
    } catch (err) {
      this.logger.error('Failed to fetch conversations from Conversation Service', err);
      for (const conversation of CONVERSATIONS) {
        for (const participantId of conversation.participantIds) {
          if (!userIdSet.has(participantId)) {
            continue;
          }

          const userConversations = result.get(participantId);
          if (userConversations) {
            userConversations.push(toConversationOutput(conversation));
          }
        }
      }
    }

    return result;
  }
}
