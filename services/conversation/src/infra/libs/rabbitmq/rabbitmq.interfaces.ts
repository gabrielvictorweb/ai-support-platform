export interface CreateMessageEvent {
    conversationId: string;
    senderId?: string | null;
    content: string;
}
