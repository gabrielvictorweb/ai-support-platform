import { Injectable, Inject } from '@nestjs/common';
import { type ICreateMessage } from '../ports/output/message.repository';
import {
    type CreateMessageInput,
    type MessageOutput,
    toMessageOutput,
} from '../dtos';
import { type CreateMessageUseCase as CreateMessageUseCasePort } from '../ports/input';

@Injectable()
export class CreateMessageUseCase implements CreateMessageUseCasePort {
    constructor(
        @Inject('CreateMessage')
        private readonly createMessage: ICreateMessage,
    ) {}

    async execute(input: CreateMessageInput): Promise<MessageOutput> {
        const message = await this.createMessage.create({
            conversationId: input.conversationId,
            content: input.content,
            createdAt: new Date(),
            updatedAt: new Date(),
        });

        return toMessageOutput(message);
    }
}
