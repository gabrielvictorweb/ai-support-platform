import { type AgentAnswerOutput } from '../dtos';
import { type AgentChatPort } from '../ports/output';

export class AskAgentUseCase {
  constructor(private readonly agentChatPort: AgentChatPort) {}

  execute(userId: string, query: string): Promise<AgentAnswerOutput> {
    // Conversa-assistente determinística por usuário (isola a memória do agent).
    return this.agentChatPort.ask(`assistant-${userId}`, query);
  }
}
