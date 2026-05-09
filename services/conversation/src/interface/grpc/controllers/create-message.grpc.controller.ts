import { Controller } from '@nestjs/common';
import { GrpcMethod } from '@nestjs/microservices';
import { CreateMessageUseCase } from '../../../application/usecases/create-message.usecase';
import { type CreateMessageInput } from '../../../application/dtos';
import { MessagePresenter } from 'src/interface/presenters/message.presenter';

@Controller()
export class CreateMessageGrpcController {
    constructor(private readonly createMessageUseCase: CreateMessageUseCase) {}

    @GrpcMethod('MessageService', 'CreateMessage')
    async execute(request: CreateMessageInput) {
        const message = await this.createMessageUseCase.execute({
            conversationId: request.conversationId,
            content: request.content,
        });

        return MessagePresenter.toGrpcResponse(message);
    }
}
