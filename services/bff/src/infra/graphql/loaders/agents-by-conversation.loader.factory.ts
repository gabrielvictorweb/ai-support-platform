import { Inject, Injectable } from '@nestjs/common';
import DataLoader from 'dataloader';
import { APP_TOKENS } from '../../../application/tokens';
import { GetAgentsByConversationIdsUseCase } from '../../../application/usecases/get-agents-by-conversation-ids.usecase';
import { type AgentOutput } from '../../../application/dtos';

@Injectable()
export class AgentsByConversationLoaderFactory {
  constructor(
    @Inject(APP_TOKENS.GET_AGENTS_BY_CONVERSATION_IDS_USE_CASE)
    private readonly getAgentsByConversationIdsUseCase: GetAgentsByConversationIdsUseCase,
  ) {}

  create(): DataLoader<string, AgentOutput[]> {
    return new DataLoader<string, AgentOutput[]>(async (conversationIds) => {
      const conversationIdsList = [...conversationIds];
      const agentsByConversationId =
        await this.getAgentsByConversationIdsUseCase.execute({
          conversationIds: conversationIdsList,
        });

      return conversationIdsList.map(
        (conversationId) => agentsByConversationId.get(conversationId) ?? [],
      );
    });
  }
}
