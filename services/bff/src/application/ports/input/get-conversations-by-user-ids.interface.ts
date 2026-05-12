import { ConversationOutput, GetConversationsByUserIdsDto } from '../../dtos';

export interface GetConversationsByUserIdsInput {
  execute(
    input: GetConversationsByUserIdsDto,
  ): Promise<Map<string, ConversationOutput[]>>;
}
