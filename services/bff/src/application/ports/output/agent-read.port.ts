import { AgentOutput } from '../../dtos';

export interface AgentReadPort {
  findByConversationIds(
    conversationIds: string[],
  ): Promise<Map<string, AgentOutput[]>>;
}
