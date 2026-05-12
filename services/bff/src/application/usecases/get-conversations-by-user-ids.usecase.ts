import { type GetConversationsByUserIdsInput } from '../ports/input';
import {
  type ConversationOutput,
  type GetConversationsByUserIdsDto,
} from '../dtos';
import { type ConversationReadPort } from '../ports/output';

export class GetConversationsByUserIdsUseCase implements GetConversationsByUserIdsInput {
  constructor(private readonly conversationReadPort: ConversationReadPort) {}

  async execute(
    input: GetConversationsByUserIdsDto,
  ): Promise<Map<string, ConversationOutput[]>> {
    return this.conversationReadPort.findByUserIds(input.userIds);
  }
}
