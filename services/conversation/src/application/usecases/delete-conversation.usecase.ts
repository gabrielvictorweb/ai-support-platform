import { Injectable, Inject, NotFoundException } from '@nestjs/common';
import {
    type IDeleteConversation,
    type IFindConversationById,
} from '../ports/output/conversation.repository';
import { type DeleteConversationInput, type DeleteResultOutput } from '../dtos';
import { type DeleteConversationUseCase as DeleteConversationUseCasePort } from '../ports/input';

@Injectable()
export class DeleteConversationUseCase implements DeleteConversationUseCasePort {
    constructor(
        @Inject('FindConversationById')
        private readonly findConversationById: IFindConversationById,
        @Inject('DeleteConversation')
        private readonly deleteConversation: IDeleteConversation,
    ) {}

    async execute(input: DeleteConversationInput): Promise<DeleteResultOutput> {
        const conversation = await this.findConversationById.findById(input.id);
        if (!conversation) {
            throw new NotFoundException(
                `Conversation with id ${input.id} not found`,
            );
        }
        const success = await this.deleteConversation.delete(input.id);
        return { success };
    }
}
