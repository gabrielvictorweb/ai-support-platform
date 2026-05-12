import { Injectable } from '@nestjs/common';
import { AgentReadPort } from '../../application/ports/output/agent-read.port';
import { type AgentOutput, toAgentOutput } from '../../application/dtos';
import { AgentEntity } from '../../domain/entities/agent.entity';

const AGENTS = [
  new AgentEntity('a1', 'c1', 'SupportBot'),
  new AgentEntity('a2', 'c1', 'AnalystBot'),
  new AgentEntity('a3', 'c2', 'HelperBot'),
];

@Injectable()
export class AgentsGrpcClient implements AgentReadPort {
  async findByConversationIds(
    conversationIds: string[],
  ): Promise<Map<string, AgentOutput[]>> {
    const conversationIdSet = new Set(conversationIds);
    const result = new Map<string, AgentOutput[]>();

    for (const conversationId of conversationIds) {
      result.set(conversationId, []);
    }

    for (const agent of AGENTS) {
      if (!conversationIdSet.has(agent.conversationId)) {
        continue;
      }

      const conversationAgents = result.get(agent.conversationId);
      if (conversationAgents) {
        conversationAgents.push(toAgentOutput(agent));
      }
    }

    return result;
  }
}
