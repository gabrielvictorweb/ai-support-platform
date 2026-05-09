import { Injectable, Inject } from '@nestjs/common';
import { type IFindConversations } from '../ports/output/conversation.repository';
import { type ConversationOutput, toConversationOutput } from '../dtos';
import { type ListConversationsUseCase as ListConversationsUseCasePort } from '../ports/input';

@Injectable()
export class ListConversationsUseCase implements ListConversationsUseCasePort {
    constructor(
        @Inject('FindConversations')
        private readonly findConversations: IFindConversations,
    ) {}

    async execute(): Promise<ConversationOutput[]> {
        const conversations = await this.findConversations.findAll();
        return conversations.map((conversation) =>
            toConversationOutput(conversation),
        );
    }
}
