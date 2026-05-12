import { Controller } from '@nestjs/common';
import { GrpcMethod } from '@nestjs/microservices';
import { GetConversationUseCase } from '../../../application/usecases/get-conversation.usecase';
import { type GetConversationDto } from '../../../application/dtos';
import { ConversationPresenter } from 'src/presentation/presenters/conversation.presenter';
import { RpcException } from '@nestjs/microservices';
import { status } from '@grpc/grpc-js';

@Controller()
export class GetConversationGrpcController {
    constructor(
        private readonly getConversationUseCase: GetConversationUseCase,
    ) {}

    @GrpcMethod('ConversationService', 'GetConversation')
    async execute(request: GetConversationDto) {
        const conversation = await this.getConversationUseCase.execute({
            id: request.id,
        });

        if (!conversation) {
            throw new RpcException({
                code: status.NOT_FOUND,
                message: `Conversation with id ${request.id} not found`,
            });
        }

        return ConversationPresenter.toGrpcResponse(conversation);
    }
}
