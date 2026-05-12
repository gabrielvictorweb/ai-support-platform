import { AgentOutput, GetAgentsByConversationIdsDto } from '../../dtos';

export interface GetAgentsByConversationIdsInput {
  execute(
    input: GetAgentsByConversationIdsDto,
  ): Promise<Map<string, AgentOutput[]>>;
}
