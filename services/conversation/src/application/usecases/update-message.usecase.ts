import { Injectable, Inject, NotFoundException } from '@nestjs/common';
import {
    type IFindMessageById,
    type IUpdateMessage,
} from '../ports/output/message.repository';
import {
    type MessageOutput,
    type UpdateMessageInput,
    toMessageOutput,
} from '../dtos';
import { Message } from '../../domain/entities/message.entity';
import { type UpdateMessageUseCase as UpdateMessageUseCasePort } from '../ports/input';

@Injectable()
export class UpdateMessageUseCase implements UpdateMessageUseCasePort {
    constructor(
        @Inject('FindMessageById')
        private readonly findMessageById: IFindMessageById,
        @Inject('UpdateMessage')
        private readonly updateMessage: IUpdateMessage,
    ) {}

    async execute(input: UpdateMessageInput): Promise<MessageOutput | null> {
        const message = await this.findMessageById.findById(input.id);
        if (!message) {
            throw new NotFoundException(
                `Message with id ${input.id} not found`,
            );
        }

        const updates: Partial<Message> = {};
        if (input.content) updates.content = input.content;

        const updated = await this.updateMessage.update(input.id, updates);

        return updated ? toMessageOutput(updated) : null;
    }
}
