import { type GetAgentsByConversationIdsInput } from '../ports/input';
import { type AgentOutput, type GetAgentsByConversationIdsDto } from '../dtos';
import { type AgentReadPort } from '../ports/output';

export class GetAgentsByConversationIdsUseCase implements GetAgentsByConversationIdsInput {
  constructor(private readonly agentReadPort: AgentReadPort) {}

  async execute(
    input: GetAgentsByConversationIdsDto,
  ): Promise<Map<string, AgentOutput[]>> {
    return this.agentReadPort.findByConversationIds(input.conversationIds);
  }
}
