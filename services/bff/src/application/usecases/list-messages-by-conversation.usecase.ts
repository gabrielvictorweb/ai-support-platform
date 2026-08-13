import { type MessageOutput } from '../dtos';
import { type MessageReadPort } from '../ports/output';

export class ListMessagesByConversationUseCase {
  constructor(private readonly messageReadPort: MessageReadPort) {}

  execute(conversationId: string): Promise<MessageOutput[]> {
    return this.messageReadPort.listByConversation(conversationId);
  }
}
