import { Injectable, Inject } from '@nestjs/common';
import { type IFindConversationById } from '../ports/output/conversation.output';
import {
    type ConversationOutput,
    type GetConversationDto,
    toConversationOutput,
} from '../dtos';
import { type GetConversationInput as GetConversationInputPort } from '../ports/input';

@Injectable()
export class GetConversationUseCase implements GetConversationInputPort {
    constructor(
        @Inject('FindConversationById')
        private readonly findConversationById: IFindConversationById,
    ) {}

    async execute(
        input: GetConversationDto,
    ): Promise<ConversationOutput | null> {
        const conversation = await this.findConversationById.findById(input.id);
        if (!conversation) {
            return null;
        }

        return toConversationOutput(conversation);
    }
}
