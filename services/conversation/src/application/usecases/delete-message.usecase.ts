import { Injectable, Inject, NotFoundException } from '@nestjs/common';
import {
    type IDeleteMessage,
    type IFindMessageById,
} from '../ports/output/message.repository';
import { type DeleteMessageInput, type DeleteResultOutput } from '../dtos';
import { type DeleteMessageUseCase as DeleteMessageUseCasePort } from '../ports/input';

@Injectable()
export class DeleteMessageUseCase implements DeleteMessageUseCasePort {
    constructor(
        @Inject('FindMessageById')
        private readonly findMessageById: IFindMessageById,
        @Inject('DeleteMessage')
        private readonly deleteMessage: IDeleteMessage,
    ) {}

    async execute(input: DeleteMessageInput): Promise<DeleteResultOutput> {
        const message = await this.findMessageById.findById(input.id);
        if (!message) {
            throw new NotFoundException(
                `Message with id ${input.id} not found`,
            );
        }
        const success = await this.deleteMessage.delete(input.id);
        return { success };
    }
}
