import { Injectable, Inject, NotFoundException } from '@nestjs/common';
import {
    type IFindConversationById,
    type IUpdateConversation,
} from '../ports/output/conversation.repository';
import {
    type ConversationOutput,
    type UpdateConversationInput,
    toConversationOutput,
} from '../dtos';
import { Conversation } from '../../domain/entities/conversation.entity';
import { type UpdateConversationUseCase as UpdateConversationUseCasePort } from '../ports/input';

@Injectable()
export class UpdateConversationUseCase implements UpdateConversationUseCasePort {
    constructor(
        @Inject('FindConversationById')
        private readonly findConversationById: IFindConversationById,
        @Inject('UpdateConversation')
        private readonly updateConversation: IUpdateConversation,
    ) {}

    async execute(
        input: UpdateConversationInput,
    ): Promise<ConversationOutput | null> {
        const conversation = await this.findConversationById.findById(input.id);
        if (!conversation) {
            throw new NotFoundException(
                `Conversation with id ${input.id} not found`,
            );
        }

        const updates: Partial<Conversation> = {};
        if (input.participantIds) {
            updates.participantIds = input.participantIds;
        }

        const updated = await this.updateConversation.update(input.id, updates);

        return updated ? toConversationOutput(updated) : null;
    }
}
