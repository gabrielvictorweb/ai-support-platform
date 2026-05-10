import { Injectable, Inject } from '@nestjs/common';
import { type ICreateConversation } from '../ports/output/conversation.output';
import {
    type ConversationOutput,
    type CreateConversationDto,
    toConversationOutput,
} from '../dtos';
import { type CreateConversationInput as CreateConversationInputPort } from '../ports/input';

@Injectable()
export class CreateConversationUseCase implements CreateConversationInputPort {
    constructor(
        @Inject('CreateConversation')
        private readonly createConversation: ICreateConversation,
    ) {}

    async execute(input: CreateConversationDto): Promise<ConversationOutput> {
        const participantIds = input.participantIds ?? [];

        const conversation = await this.createConversation.create({
            participantIds,
            createdAt: new Date(),
            updatedAt: new Date(),
        });

        return toConversationOutput(conversation);
    }
}
