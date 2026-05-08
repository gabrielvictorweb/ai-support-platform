import { Injectable, Inject } from '@nestjs/common';
import { type IFindInvitesByConversationId } from '../ports/output/invite.output';
import {
    type InviteOutput,
    type ListInvitesByConversationInput,
    toInviteOutput,
} from '../dtos';
import { type ListInvitesByConversationUseCase as ListInvitesByConversationUseCasePort } from '../ports/input';

@Injectable()
export class ListInvitesByConversationUseCase implements ListInvitesByConversationUseCasePort {
    constructor(
        @Inject('FindInvitesByConversationId')
        private readonly findInvitesByConversationId: IFindInvitesByConversationId,
    ) {}

    async execute(
        input: ListInvitesByConversationInput,
    ): Promise<InviteOutput[]> {
        const invites =
            await this.findInvitesByConversationId.findByConversationId(
                input.conversationId,
            );

        return invites.map((invite) => toInviteOutput(invite));
    }
}
