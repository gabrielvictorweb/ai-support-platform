import { Controller } from '@nestjs/common';
import { GrpcMethod } from '@nestjs/microservices';
import { CreateMessageUseCase } from '../../../application/usecases/create-message.usecase';
import { type CreateMessageDto } from '../../../application/dtos';
import { MessagePresenter } from 'src/presentation/presenters/message.presenter';
import { ChatGateway } from '../../gateways/chat.gateway';

@Controller()
export class CreateMessageGrpcController {
    constructor(
        private readonly createMessageUseCase: CreateMessageUseCase,
        private readonly chatGateway: ChatGateway,
    ) {}

    @GrpcMethod('MessageService', 'CreateMessage')
    async execute(request: CreateMessageDto) {
        const message = await this.createMessageUseCase.execute({
            conversationId: request.conversationId,
            // gRPC envia '' quando ausente; normaliza para null (mensagem de sistema).
            senderId: request.senderId ? request.senderId : null,
            content: request.content,
        });

        // Broadcast em tempo real para os clientes Socket.IO. Antes só o consumer
        // RabbitMQ fazia isso; agora o envio via gRPC (BFF) também emite.
        this.chatGateway.emitMessageCreated(message);

        return MessagePresenter.toGrpcResponse(message);
    }
}
