import { Injectable, Inject, NotFoundException } from '@nestjs/common';
import { type IFindMessageById } from '../ports/output/message.output';
import {
    type GetMessageDto,
    type MessageOutput,
    toMessageOutput,
} from '../dtos';
import { type GetMessageInput as GetMessageInputPort } from '../ports/input';

@Injectable()
export class GetMessageUseCase implements GetMessageInputPort {
    constructor(
        @Inject('FindMessageById')
        private readonly findMessageById: IFindMessageById,
    ) {}

    async execute(input: GetMessageDto): Promise<MessageOutput> {
        const message = await this.findMessageById.findById(input.id);
        if (!message) {
            throw new NotFoundException(
                `Message with id ${input.id} not found`,
            );
        }

        return toMessageOutput(message);
    }
}
