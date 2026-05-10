import { Message } from 'src/domain/entities/message.entity';

export type MessageCursorPaginationInput = {
    cursor?: string;
    limit: number;
};

export type MessageCursorPaginationResult = {
    items: Message[];
    nextCursor: string | null;
    hasNextPage: boolean;
};

export interface ICreateMessage {
    create(message: Omit<Message, 'id'>): Promise<Message>;
}

export interface IFindMessageById {
    findById(id: string): Promise<Message | null>;
}

export interface IFindMessagesByConversationId {
    findByConversationId(
        conversationId: string,
        pagination: MessageCursorPaginationInput,
    ): Promise<MessageCursorPaginationResult>;
}

export interface IFindMessages {
    findAll(
        pagination: MessageCursorPaginationInput,
    ): Promise<MessageCursorPaginationResult>;
}

export interface IUpdateMessage {
    update(id: string, data: Partial<Message>): Promise<Message | null>;
}

export interface IDeleteMessage {
    delete(id: string): Promise<boolean>;
}
