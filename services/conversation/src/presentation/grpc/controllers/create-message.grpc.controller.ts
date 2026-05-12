import { Controller } from '@nestjs/common';
import { GrpcMethod } from '@nestjs/microservices';
import { CreateMessageUseCase } from '../../../application/usecases/create-message.usecase';
import { type CreateMessageDto } from '../../../application/dtos';
import { MessagePresenter } from 'src/presentation/presenters/message.presenter';

@Controller()
export class CreateMessageGrpcController {
    constructor(private readonly createMessageUseCase: CreateMessageUseCase) {}

    @GrpcMethod('MessageService', 'CreateMessage')
    async execute(request: CreateMessageDto) {
        const message = await this.createMessageUseCase.execute({
            conversationId: request.conversationId,
            content: request.content,
        });

        return MessagePresenter.toGrpcResponse(message);
    }
}
