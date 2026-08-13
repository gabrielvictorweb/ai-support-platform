import { Inject, Injectable, Logger, OnModuleInit } from '@nestjs/common';
import type { ClientGrpc } from '@nestjs/microservices';
import { firstValueFrom, Observable } from 'rxjs';
import { MessageReadPort } from '../../application/ports/output/message-read.port';
import { type MessageOutput, type SendMessageDto } from '../../application/dtos';

interface MessageMessage {
  id: string;
  conversationId: string;
  senderId?: string;
  content: string;
  createdAt?: string;
  updatedAt?: string;
}

interface MessageConnection {
  items: MessageMessage[];
  nextCursor: string;
  hasNextPage: boolean;
}

interface MessageResponse {
  message: MessageMessage;
}

interface MessageServiceClient {
  listMessagesByConversation(request: {
    conversationId: string;
    cursor?: string;
    limit?: number;
  }): Observable<MessageConnection>;
  createMessage(request: {
    conversationId: string;
    content: string;
    senderId: string;
  }): Observable<MessageResponse>;
}

@Injectable()
export class MessagesGrpcClient implements MessageReadPort, OnModuleInit {
  private readonly logger = new Logger(MessagesGrpcClient.name);
  private messageService?: MessageServiceClient;

  constructor(
    @Inject('CONVERSATIONS_GRPC_CLIENT')
    private readonly grpcClient: ClientGrpc,
  ) {}

  onModuleInit(): void {
    this.messageService =
      this.grpcClient.getService<MessageServiceClient>('MessageService');
  }

  private toOutput(message: MessageMessage): MessageOutput {
    return {
      id: message.id,
      conversationId: message.conversationId,
      // gRPC manda '' para senderId ausente; normaliza para null (mensagem de sistema).
      senderId: message.senderId ? message.senderId : null,
      content: message.content,
      createdAt: message.createdAt ? new Date(message.createdAt) : new Date(),
      updatedAt: message.updatedAt ? new Date(message.updatedAt) : new Date(),
    };
  }

  async listByConversation(conversationId: string): Promise<MessageOutput[]> {
    if (!this.messageService) {
      this.logger.warn('Conversation Service unavailable, returning no messages');
      return [];
    }

    try {
      const response = await firstValueFrom(
        this.messageService.listMessagesByConversation({
          conversationId,
          limit: 100,
        }),
      );

      // O repositório ordena desc (mais recente primeiro); a thread precisa de
      // ordem cronológica (mais antiga primeiro).
      return (response.items ?? [])
        .map((item) => this.toOutput(item))
        .reverse();
    } catch (err) {
      this.logger.error(
        `Failed to list messages for conversation ${conversationId}`,
        err,
      );
      return [];
    }
  }

  async create(input: SendMessageDto): Promise<MessageOutput> {
    if (!this.messageService) {
      throw new Error('Conversation Service unavailable');
    }

    const response = await firstValueFrom(
      this.messageService.createMessage({
        conversationId: input.conversationId,
        content: input.content,
        senderId: input.senderId,
      }),
    );

    return this.toOutput(response.message);
  }
}
