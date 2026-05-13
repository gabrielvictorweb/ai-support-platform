import { Inject, Injectable, Logger, OnModuleInit } from '@nestjs/common';
import type { ClientGrpc } from '@nestjs/microservices';
import { firstValueFrom, type Observable } from 'rxjs';

import { type AgentOutput, toAgentOutput } from '../../application/dtos';
import type { AgentReadPort } from '../../application/ports/output/agent-read.port';
import { AgentEntity } from '../../domain/entities/agent.entity';

interface AgentMessage {
  id: string;
  conversationId: string;
  name: string;
  systemPrompt?: string;
  model?: string;
}

interface ConversationAgentsMessage {
  conversationId: string;
  agents: AgentMessage[];
}

interface GetAgentsByConversationIdsResponse {
  items: ConversationAgentsMessage[];
}

interface AgentServiceClient {
  getAgentsByConversationIds(request: {
    conversationIds: string[];
  }): Observable<GetAgentsByConversationIdsResponse>;
}

@Injectable()
export class AgentsGrpcClient implements AgentReadPort, OnModuleInit {
  private readonly logger = new Logger(AgentsGrpcClient.name);
  private agentService?: AgentServiceClient;

  constructor(
    @Inject('AGENTS_GRPC_CLIENT')
    private readonly grpcClient: ClientGrpc,
  ) {}

  onModuleInit(): void {
    this.agentService =
      this.grpcClient.getService<AgentServiceClient>('AgentService');
  }

  async findByConversationIds(
    conversationIds: string[],
  ): Promise<Map<string, AgentOutput[]>> {
    const result = new Map<string, AgentOutput[]>(
      conversationIds.map((id) => [id, []]),
    );

    if (!this.agentService) {
      this.logger.warn('Agent Service unavailable — returning empty maps');
      return result;
    }

    try {
      const response = await firstValueFrom(
        this.agentService.getAgentsByConversationIds({ conversationIds }),
      );

      for (const item of response.items ?? []) {
        const agents = (item.agents ?? []).map((a) =>
          toAgentOutput(new AgentEntity(a.id, a.conversationId, a.name)),
        );
        result.set(item.conversationId, agents);
      }
    } catch (err) {
      this.logger.error('Failed to fetch agents from Agent Service', err);
    }

    return result;
  }
}
