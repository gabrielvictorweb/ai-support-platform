import { Controller } from '@nestjs/common';
import { GrpcMethod } from '@nestjs/microservices';
import { ListInvitesByConversationUseCase } from '../../../application/usecases/list-invites-by-conversation.usecase';
import { type ListInvitesByConversationDto } from '../../../application/dtos';
import { InvitePresenter } from 'src/presentation/presenters/invite.presenter';

@Controller()
export class ListInvitesByConversationGrpcController {
    constructor(
        private readonly listInvitesByConversationUseCase: ListInvitesByConversationUseCase,
    ) {}

    @GrpcMethod('InviteService', 'ListInvitesByConversation')
    async execute(request: ListInvitesByConversationDto) {
        const invites = await this.listInvitesByConversationUseCase.execute({
            conversationId: request.conversationId,
        });

        return {
            items: invites.map((invite) => {
                return InvitePresenter.toGrpcResponse(invite).invite;
            }),
        };
    }
}
