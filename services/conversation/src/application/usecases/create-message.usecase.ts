import { Injectable, Inject } from '@nestjs/common';
import { type ICreateMessage } from '../ports/output/message.output';
import {
    type CreateMessageDto,
    type MessageOutput,
    toMessageOutput,
} from '../dtos';
import { type CreateMessageInput as CreateMessageInputPort } from '../ports/input';

@Injectable()
export class CreateMessageUseCase implements CreateMessageInputPort {
    constructor(
        @Inject('CreateMessage')
        private readonly createMessage: ICreateMessage,
    ) {}

    async execute(input: CreateMessageDto): Promise<MessageOutput> {
        const message = await this.createMessage.create({
            conversationId: input.conversationId,
            content: input.content,
            createdAt: new Date(),
            updatedAt: new Date(),
        });

        return toMessageOutput(message);
    }
}
