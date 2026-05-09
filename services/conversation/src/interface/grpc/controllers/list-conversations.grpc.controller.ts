import { Controller } from '@nestjs/common';
import { GrpcMethod } from '@nestjs/microservices';
import { ListConversationsUseCase } from '../../../application/usecases/list-conversations.usecase';
import { type ListConversationsInput } from '../../../application/dtos';
import { ConversationPresenter } from 'src/interface/presenters/conversation.presenter';

@Controller()
export class ListConversationsGrpcController {
    constructor(
        private readonly listConversationsUseCase: ListConversationsUseCase,
    ) {}

    @GrpcMethod('ConversationService', 'ListConversations')
    async execute(request: ListConversationsInput) {
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
