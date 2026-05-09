import { Controller } from '@nestjs/common';
import { GrpcMethod } from '@nestjs/microservices';
import { CreateConversationUseCase } from '../../../application/usecases/create-conversation.usecase';
import { type CreateConversationInput } from '../../../application/dtos';
import { ConversationPresenter } from 'src/interface/presenters/conversation.presenter';

@Controller()
export class CreateConversationGrpcController {
    constructor(
        private readonly createConversationUseCase: CreateConversationUseCase,
    ) {}

    @GrpcMethod('ConversationService', 'CreateConversation')
    async execute(request: CreateConversationInput) {
        const conversation = await this.createConversationUseCase.execute({
            participantIds: request.participantIds ?? [],
        });

        return ConversationPresenter.toGrpcResponse(conversation);
    }
}
