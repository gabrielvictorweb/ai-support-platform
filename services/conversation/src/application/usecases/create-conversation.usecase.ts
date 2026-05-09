import { Injectable, Inject } from '@nestjs/common';
import { type ICreateConversation } from '../ports/output/conversation.repository';
import {
    type ConversationOutput,
    type CreateConversationInput,
    toConversationOutput,
} from '../dtos';
import { type CreateConversationUseCase as CreateConversationUseCasePort } from '../ports/input';

@Injectable()
export class CreateConversationUseCase implements CreateConversationUseCasePort {
    constructor(
        @Inject('CreateConversation')
        private readonly createConversation: ICreateConversation,
    ) {}

    async execute(input: CreateConversationInput): Promise<ConversationOutput> {
        const participantIds = input.participantIds ?? [];

        const conversation = await this.createConversation.create({
            participantIds,
            createdAt: new Date(),
            updatedAt: new Date(),
        });

        return toConversationOutput(conversation);
    }
}
