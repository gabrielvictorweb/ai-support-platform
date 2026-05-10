import { Controller } from '@nestjs/common';
import { GrpcMethod } from '@nestjs/microservices';
import { ListMessagesByConversationUseCase } from '../../../application/usecases/list-messages-by-conversation.usecase';
import { type ListMessagesByConversationDto } from '../../../application/dtos';
import { MessageConnectionPresenter } from 'src/interface/presenters/messageConnection.presenter';

@Controller()
export class ListMessagesByConversationGrpcController {
    constructor(
        private readonly listMessagesByConversationUseCase: ListMessagesByConversationUseCase,
    ) {}

    @GrpcMethod('MessageService', 'ListMessagesByConversation')
    async execute(request: ListMessagesByConversationDto) {
        const connection = await this.listMessagesByConversationUseCase.execute(
            {
                conversationId: request.conversationId,
                cursor: request.cursor,
                limit: request.limit,
            },
        );

        return MessageConnectionPresenter.toGrpcResponse(connection);
    }
}
