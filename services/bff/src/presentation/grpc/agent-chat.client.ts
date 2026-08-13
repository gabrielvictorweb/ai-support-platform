import { Inject, Injectable, Logger, OnModuleInit } from '@nestjs/common';
import type { ClientGrpc } from '@nestjs/microservices';
import { firstValueFrom, type Observable } from 'rxjs';
import { AgentChatPort } from '../../application/ports/output/agent-chat.port';
import { type AgentAnswerOutput } from '../../application/dtos';

const DEFAULT_SYSTEM_PROMPT =
  'Você é um assistente de suporte prestativo e objetivo. Responda em português, de forma clara e breve.';
const DEFAULT_MODEL = 'gpt-4o-mini';

interface AgentMessage {
  id: string;
  conversationId: string;
  name: string;
}

interface ListAgentsResponse {
  agents?: AgentMessage[];
}

interface AgentResponse {
  agent: AgentMessage;
}

interface RetrievedChunk {
  chunkId?: string;
  content?: string;
  score?: number;
  source?: string;
}

interface QueryAgentResponse {
  answer: string;
  sources?: RetrievedChunk[];
}

interface AgentServiceClient {
  listAgents(request: {
    conversationId: string;
  }): Observable<ListAgentsResponse>;
  createAgent(request: {
    conversationId: string;
    name: string;
    systemPrompt: string;
    model: string;
  }): Observable<AgentResponse>;
}

interface RagServiceClient {
  queryAgent(request: {
    agentId: string;
    conversationId: string;
    query: string;
    topK: number;
  }): Observable<QueryAgentResponse>;
}

@Injectable()
export class AgentChatGrpcClient implements AgentChatPort, OnModuleInit {
  private readonly logger = new Logger(AgentChatGrpcClient.name);
  private agentService?: AgentServiceClient;
  private ragService?: RagServiceClient;

  constructor(
    @Inject('AGENTS_GRPC_CLIENT')
    private readonly grpcClient: ClientGrpc,
  ) {}

  onModuleInit(): void {
    this.agentService =
      this.grpcClient.getService<AgentServiceClient>('AgentService');
    this.ragService =
      this.grpcClient.getService<RagServiceClient>('RagService');
  }

  // Garante um agent "Assistente" por conversa (cria sob demanda na 1ª pergunta).
  private async ensureAgent(conversationId: string): Promise<string> {
    const list = await firstValueFrom(
      this.agentService!.listAgents({ conversationId }),
    );
    const existing = list.agents?.[0];
    if (existing) return existing.id;

    const created = await firstValueFrom(
      this.agentService!.createAgent({
        conversationId,
        name: 'Assistente',
        systemPrompt: DEFAULT_SYSTEM_PROMPT,
        model: DEFAULT_MODEL,
      }),
    );
    return created.agent.id;
  }

  async ask(conversationId: string, query: string): Promise<AgentAnswerOutput> {
    if (!this.agentService || !this.ragService) {
      throw new Error('Agent Service unavailable');
    }

    const agentId = await this.ensureAgent(conversationId);
    const response = await firstValueFrom(
      this.ragService.queryAgent({ agentId, conversationId, query, topK: 4 }),
    );

    return {
      answer: response.answer,
      sources: (response.sources ?? []).map((chunk) => ({
        content: chunk.content ?? '',
        source: chunk.source ?? '',
        score: chunk.score ?? 0,
      })),
    };
  }
}
