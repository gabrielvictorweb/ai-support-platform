import { type MessageCursorPaginationResult } from '../ports/output/message.output';
import { Message } from '../../domain/entities/message.entity';

export interface MessageOutput {
    id: string;
    conversationId: string;
    content: string;
    createdAt: Date;
    updatedAt: Date;
}

export interface MessageConnectionOutput {
    items: MessageOutput[];
    nextCursor: string | null;
    hasNextPage: boolean;
}

export const toMessageOutput = (message: Message): MessageOutput => ({
    id: message.id,
    conversationId: message.conversationId,
    content: message.content,
    createdAt: message.createdAt,
    updatedAt: message.updatedAt,
});

export const toMessageConnectionOutput = (
    result: MessageCursorPaginationResult,
): MessageConnectionOutput => ({
    items: result.items.map((item) => toMessageOutput(item)),
    nextCursor: result.nextCursor,
    hasNextPage: result.hasNextPage,
});

export interface CreateMessageDto {
    conversationId: string;
    content: string;
}

export interface GetMessageDto {
    id: string;
}

export interface ListMessagesDto {
    cursor?: string;
    limit?: number;
}

export interface ListMessagesByConversationDto {
    conversationId: string;
    cursor?: string;
    limit?: number;
}

export interface UpdateMessageDto {
    id: string;
    content?: string;
}

export interface DeleteMessageDto {
    id: string;
}
