import { Inject, UseGuards } from '@nestjs/common';
import { Args, Context, ID, Mutation, Query, Resolver } from '@nestjs/graphql';
import { APP_TOKENS } from '../../../application/tokens';
import { ListMessagesByConversationUseCase } from '../../../application/usecases/list-messages-by-conversation.usecase';
import { SendMessageUseCase } from '../../../application/usecases/send-message.usecase';
import { GetOrProvisionUserUseCase } from '../../../application/usecases/get-or-provision-user.usecase';
import { MessagePresenter } from '../../presenters';
import { GraphqlAuthGuard } from '../../../infra/graphql/auth/guards/graphql-auth.guard';
import type { GraphqlContext } from '../context/graphql-context.types';
import { MessageDto } from '../dto/message.dto';

@Resolver(() => MessageDto)
export class MessagesResolver {
  constructor(
    @Inject(APP_TOKENS.LIST_MESSAGES_BY_CONVERSATION_USE_CASE)
    private readonly listMessagesByConversationUseCase: ListMessagesByConversationUseCase,
    @Inject(APP_TOKENS.SEND_MESSAGE_USE_CASE)
    private readonly sendMessageUseCase: SendMessageUseCase,
    @Inject(APP_TOKENS.GET_OR_PROVISION_USER_USE_CASE)
    private readonly getOrProvisionUserUseCase: GetOrProvisionUserUseCase,
  ) {}

  @UseGuards(GraphqlAuthGuard)
  @Query(() => [MessageDto])
  async messages(
    @Args('conversationId', { type: () => ID }) conversationId: string,
  ): Promise<MessageDto[]> {
    const messages =
      await this.listMessagesByConversationUseCase.execute(conversationId);

    return messages.map((message) => MessagePresenter.toGraphql(message));
  }

  @UseGuards(GraphqlAuthGuard)
  @Mutation(() => MessageDto)
  async sendMessage(
    @Args('conversationId', { type: () => ID }) conversationId: string,
    @Args('content') content: string,
    @Context() context: GraphqlContext,
  ): Promise<MessageDto> {
    // O senderId é derivado do token no servidor (id interno do usuário
    // provisionado = Participant.userId), nunca vindo do cliente.
    const sender = await this.getOrProvisionUserUseCase.execute({
      externalId: context.user!.userId,
      name: context.user!.name,
      email: context.user!.email,
    });

    const message = await this.sendMessageUseCase.execute({
      conversationId,
      senderId: sender.id,
      content,
    });

    return MessagePresenter.toGraphql(message);
  }
}
