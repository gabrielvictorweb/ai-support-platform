import { Injectable, Inject, NotFoundException } from '@nestjs/common';
import {
    type IDeleteMessage,
    type IFindMessageById,
} from '../ports/output/message.output';
import { type DeleteMessageDto, type DeleteResultOutput } from '../dtos';
import { type DeleteMessageInput as DeleteMessageInputPort } from '../ports/input';

@Injectable()
export class DeleteMessageUseCase implements DeleteMessageInputPort {
    constructor(
        @Inject('FindMessageById')
        private readonly findMessageById: IFindMessageById,
        @Inject('DeleteMessage')
        private readonly deleteMessage: IDeleteMessage,
    ) {}

    async execute(input: DeleteMessageDto): Promise<DeleteResultOutput> {
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
