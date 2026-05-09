import { type MessageCursorPaginationResult } from '../ports/output/message.repository';
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
