import { Injectable, Inject, NotFoundException } from '@nestjs/common';
import { type IFindMessageById } from '../ports/output/message.repository';
import {
    type GetMessageInput,
    type MessageOutput,
    toMessageOutput,
} from '../dtos';
import { type GetMessageUseCase as GetMessageUseCasePort } from '../ports/input';

@Injectable()
export class GetMessageUseCase implements GetMessageUseCasePort {
    constructor(
        @Inject('FindMessageById')
        private readonly findMessageById: IFindMessageById,
    ) {}

    async execute(input: GetMessageInput): Promise<MessageOutput> {
        const message = await this.findMessageById.findById(input.id);
        if (!message) {
            throw new NotFoundException(
                `Message with id ${input.id} not found`,
            );
        }

        return toMessageOutput(message);
    }
}
