import { Inject, UseGuards } from '@nestjs/common';
import {
  Args,
  Context,
  ID,
  Parent,
  Query,
  ResolveField,
  Resolver,
} from '@nestjs/graphql';
import { APP_TOKENS } from '../../../application/tokens';
import { GetCurrentUserUseCase } from '../../../application/usecases/get-current-user.usecase';
import { ListUsersUseCase } from '../../../application/usecases/list-users.usecase';
import { ConversationPresenter, UserPresenter } from '../../presenters';
import { GraphqlAuthGuard } from '../../../infra/graphql/auth/guards/graphql-auth.guard';
import type { GraphqlContext } from '../context/graphql-context.types';
import { ConversationDto } from '../dto/conversation.dto';
import { UserDto } from '../dto/user.dto';

@Resolver(() => UserDto)
export class UsersResolver {
  constructor(
    @Inject(APP_TOKENS.GET_CURRENT_USER_USE_CASE)
    private readonly getCurrentUserUseCase: GetCurrentUserUseCase,
    @Inject(APP_TOKENS.LIST_USERS_USE_CASE)
    private readonly listUsersUseCase: ListUsersUseCase,
  ) {}

  @UseGuards(GraphqlAuthGuard)
  @Query(() => UserDto)
  async me(@Context() context: GraphqlContext): Promise<UserDto> {
    const user = await this.getCurrentUserUseCase.execute({
      userId: context.user!.userId,
    });

    return UserPresenter.toGraphql(user);
  }

  @UseGuards(GraphqlAuthGuard)
  @Query(() => [UserDto])
  async users(
    @Args('ids', { type: () => [ID], nullable: true }) ids?: string[],
  ): Promise<UserDto[]> {
    const users = await this.listUsersUseCase.execute({ userIds: ids });

    return users.map((user) => UserPresenter.toGraphql(user));
  }

  @ResolveField(() => [ConversationDto])
  async conversations(
    @Parent() user: UserDto,
    @Context() context: GraphqlContext,
  ): Promise<ConversationDto[]> {
    const conversations = await context.loaders.conversationsByUserId.load(
      user.id,
    );
    return conversations.map((conversation) =>
      ConversationPresenter.toGraphql(conversation),
    );
  }
}
