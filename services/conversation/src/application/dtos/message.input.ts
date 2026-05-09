export interface CreateMessageInput {
    conversationId: string;
    content: string;
}

export interface GetMessageInput {
    id: string;
}

export interface ListMessagesInput {
    cursor?: string;
    limit?: number;
}

export interface ListMessagesByConversationInput {
    conversationId: string;
    cursor?: string;
    limit?: number;
}

export interface UpdateMessageInput {
    id: string;
    content?: string;
}

export interface DeleteMessageInput {
    id: string;
}
