import { ConversationOutput } from '../../dtos';

export interface ConversationReadPort {
  findByUserIds(userIds: string[]): Promise<Map<string, ConversationOutput[]>>;
}
