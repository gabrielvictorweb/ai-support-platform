import { Injectable, Inject, NotFoundException } from '@nestjs/common';
import {
    type IFindMessageById,
    type IUpdateMessage,
} from '../ports/output/message.output';
import {
    type MessageOutput,
    type UpdateMessageDto,
    toMessageOutput,
} from '../dtos';
import { Message } from '../../domain/entities/message.entity';
import { type UpdateMessageInput as UpdateMessageInputPort } from '../ports/input';

@Injectable()
export class UpdateMessageUseCase implements UpdateMessageInputPort {
    constructor(
        @Inject('FindMessageById')
        private readonly findMessageById: IFindMessageById,
        @Inject('UpdateMessage')
        private readonly updateMessage: IUpdateMessage,
    ) {}

    async execute(input: UpdateMessageDto): Promise<MessageOutput | null> {
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
