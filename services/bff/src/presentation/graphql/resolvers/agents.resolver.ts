import { ForbiddenException, Inject, UseGuards } from '@nestjs/common';
import { Args, Context, Mutation, Resolver } from '@nestjs/graphql';
import { APP_TOKENS } from '../../../application/tokens';
import { AskAgentUseCase } from '../../../application/usecases/ask-agent.usecase';
import { GetOrProvisionUserUseCase } from '../../../application/usecases/get-or-provision-user.usecase';
import { GraphqlAuthGuard } from '../../../infra/graphql/auth/guards/graphql-auth.guard';
import type { GraphqlContext } from '../context/graphql-context.types';
import { AgentAnswerDto } from '../dto/agent-answer.dto';

@Resolver(() => AgentAnswerDto)
export class AgentsResolver {
  constructor(
    @Inject(APP_TOKENS.ASK_AGENT_USE_CASE)
    private readonly askAgentUseCase: AskAgentUseCase,
    @Inject(APP_TOKENS.GET_OR_PROVISION_USER_USE_CASE)
    private readonly getOrProvisionUserUseCase: GetOrProvisionUserUseCase,
  ) {}

  @UseGuards(GraphqlAuthGuard)
  @Mutation(() => AgentAnswerDto)
  async askAgent(
    @Args('query') query: string,
    @Context() context: GraphqlContext,
  ): Promise<AgentAnswerDto> {
    const user = await this.getOrProvisionUserUseCase.execute({
      externalId: context.user!.userId,
      name: context.user!.name,
      email: context.user!.email,
    });

    // O assistente é exclusivo de usuários comuns — suporte não tem acesso.
    if (user.role === 'SUPPORT') {
      throw new ForbiddenException(
        'O assistente é exclusivo de usuários comuns.',
      );
    }

    return this.askAgentUseCase.execute(user.id, query);
  }
}
