import { Controller, NotFoundException } from '@nestjs/common';
import { GrpcMethod } from '@nestjs/microservices';
import { UpdateConversationUseCase } from '../../../application/usecases/update-conversation.usecase';
import { type UpdateConversationDto } from '../../../application/dtos';
import { ConversationPresenter } from 'src/presentation/presenters/conversation.presenter';

@Controller()
export class UpdateConversationGrpcController {
    constructor(
        private readonly updateConversationUseCase: UpdateConversationUseCase,
    ) {}

    @GrpcMethod('ConversationService', 'UpdateConversation')
    async execute(request: UpdateConversationDto) {
        const conversation = await this.updateConversationUseCase.execute({
            id: request.id,
            participantIds: request.participantIds,
        });

        if (!conversation) {
            throw new NotFoundException(
                `Conversation with id ${request.id} not found`,
            );
        }

        return ConversationPresenter.toGrpcResponse(conversation);
    }
}
