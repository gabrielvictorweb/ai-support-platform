import { ConversationOutput } from '../../application/dtos';
import { ConversationDto } from '../graphql/dto/conversation.dto';

export class ConversationPresenter {
  static toGraphql(conversation: ConversationOutput): ConversationDto {
    return {
      id: conversation.id,
      participantIds: conversation.participantIds,
      createdAt: conversation.createdAt.toISOString(),
      updatedAt: conversation.updatedAt.toISOString(),
    };
  }
}
