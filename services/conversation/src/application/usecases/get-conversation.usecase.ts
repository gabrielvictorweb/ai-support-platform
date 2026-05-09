import { Injectable, Inject } from '@nestjs/common';
import { type IFindConversationById } from '../ports/output/conversation.repository';
import {
    type ConversationOutput,
    type GetConversationInput,
    toConversationOutput,
} from '../dtos';
import { type GetConversationUseCase as GetConversationUseCasePort } from '../ports/input';

@Injectable()
export class GetConversationUseCase implements GetConversationUseCasePort {
    constructor(
        @Inject('FindConversationById')
        private readonly findConversationById: IFindConversationById,
    ) {}

    async execute(
        input: GetConversationInput,
    ): Promise<ConversationOutput | null> {
        const conversation = await this.findConversationById.findById(input.id);
        if (!conversation) {
            return null;
        }

        return toConversationOutput(conversation);
    }
}
