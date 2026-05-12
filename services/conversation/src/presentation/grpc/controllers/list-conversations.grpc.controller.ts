import { Controller } from '@nestjs/common';
import { GrpcMethod } from '@nestjs/microservices';
import { ListConversationsUseCase } from '../../../application/usecases/list-conversations.usecase';
import { type ListConversationsDto } from '../../../application/dtos';
import { ConversationPresenter } from 'src/presentation/presenters/conversation.presenter';

@Controller()
export class ListConversationsGrpcController {
    constructor(
        private readonly listConversationsUseCase: ListConversationsUseCase,
    ) {}

    @GrpcMethod('ConversationService', 'ListConversations')
    async execute(request: ListConversationsDto) {
        void request;
        const conversations = await this.listConversationsUseCase.execute();

        return {
            items: conversations.map(
                (conversation) =>
                    ConversationPresenter.toGrpcResponse(conversation)
                        .conversation,
            ),
        };
    }
}
