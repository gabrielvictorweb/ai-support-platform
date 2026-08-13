import { AgentEntity } from '../../domain/entities/agent.entity';

export interface AgentOutput {
  id: string;
  conversationId: string;
  name: string;
}

export const toAgentOutput = (agent: AgentEntity): AgentOutput => ({
  id: agent.id,
  conversationId: agent.conversationId,
  name: agent.name,
});

export interface GetAgentsByConversationIdsDto {
  conversationIds: string[];
}

export interface AgentSourceOutput {
  content: string;
  source: string;
  score: number;
}

export interface AgentAnswerOutput {
  answer: string;
  sources: AgentSourceOutput[];
}
