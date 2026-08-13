import { AgentAnswerOutput } from '../../dtos';

export interface AgentChatPort {
  ask(conversationId: string, query: string): Promise<AgentAnswerOutput>;
}
