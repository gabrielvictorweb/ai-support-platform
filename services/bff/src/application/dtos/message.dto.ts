export interface MessageOutput {
  id: string;
  conversationId: string;
  senderId: string | null;
  content: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface SendMessageDto {
  conversationId: string;
  senderId: string;
  content: string;
}
