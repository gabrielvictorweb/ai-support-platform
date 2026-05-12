import { Inject, Injectable } from '@nestjs/common';
import DataLoader from 'dataloader';
import { APP_TOKENS } from '../../../application/tokens';
import { GetConversationsByUserIdsUseCase } from '../../../application/usecases/get-conversations-by-user-ids.usecase';
import { type ConversationOutput } from '../../../application/dtos';

@Injectable()
export class ConversationsByUserLoaderFactory {
  constructor(
    @Inject(APP_TOKENS.GET_CONVERSATIONS_BY_USER_IDS_USE_CASE)
    private readonly getConversationsByUserIdsUseCase: GetConversationsByUserIdsUseCase,
  ) {}

  create(): DataLoader<string, ConversationOutput[]> {
    return new DataLoader<string, ConversationOutput[]>(async (userIds) => {
      const userIdsList = [...userIds];
      const conversationsByUserId =
        await this.getConversationsByUserIdsUseCase.execute({
          userIds: userIdsList,
        });

      return userIdsList.map(
        (userId) => conversationsByUserId.get(userId) ?? [],
      );
    });
  }
}
