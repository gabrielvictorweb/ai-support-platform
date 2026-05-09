import { Controller } from '@nestjs/common';
import { GrpcMethod } from '@nestjs/microservices';
import { DeleteConversationUseCase } from '../../../application/usecases/delete-conversation.usecase';
import {
    type DeleteConversationInput,
    type DeleteResultOutput,
} from '../../../application/dtos';

@Controller()
export class DeleteConversationGrpcController {
    constructor(
        private readonly deleteConversationUseCase: DeleteConversationUseCase,
    ) {}

    @GrpcMethod('ConversationService', 'DeleteConversation')
    async execute(
        request: DeleteConversationInput,
    ): Promise<DeleteResultOutput> {
        return this.deleteConversationUseCase.execute({ id: request.id });
    }
}
