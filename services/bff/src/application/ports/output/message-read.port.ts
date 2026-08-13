import { MessageOutput, SendMessageDto } from '../../dtos';

export interface MessageReadPort {
  listByConversation(conversationId: string): Promise<MessageOutput[]>;
  create(input: SendMessageDto): Promise<MessageOutput>;
}
