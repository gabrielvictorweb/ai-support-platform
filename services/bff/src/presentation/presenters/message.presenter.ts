import { MessageOutput } from '../../application/dtos';
import { MessageDto } from '../graphql/dto/message.dto';

export class MessagePresenter {
  static toGraphql(message: MessageOutput): MessageDto {
    return {
      id: message.id,
      conversationId: message.conversationId,
      senderId: message.senderId,
      content: message.content,
      createdAt: message.createdAt.toISOString(),
      updatedAt: message.updatedAt.toISOString(),
    };
  }
}
