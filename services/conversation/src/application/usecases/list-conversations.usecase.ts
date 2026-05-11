import { Injectable, Inject } from '@nestjs/common';
import { type IFindConversations } from '../ports/output/conversation.output';
import { type ConversationOutput, toConversationOutput } from '../dtos';
import { type ListConversationsInput as ListConversationsInputPort } from '../ports/input';

@Injectable()
export class ListConversationsUseCase implements ListConversationsInputPort {
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
