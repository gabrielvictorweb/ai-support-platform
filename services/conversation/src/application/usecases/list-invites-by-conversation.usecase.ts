import { Injectable, Inject } from '@nestjs/common';
import { type IFindInvitesByConversationId } from '../ports/output/invite.output';
import {
    type InviteOutput,
    type ListInvitesByConversationDto,
    toInviteOutput,
} from '../dtos';
import { type ListInvitesByConversationInput as ListInvitesByConversationInputPort } from '../ports/input';

@Injectable()
export class ListInvitesByConversationUseCase implements ListInvitesByConversationInputPort {
    constructor(
        @Inject('FindInvitesByConversationId')
        private readonly findInvitesByConversationId: IFindInvitesByConversationId,
    ) {}

    async execute(
        input: ListInvitesByConversationDto,
    ): Promise<InviteOutput[]> {
        const invites =
            await this.findInvitesByConversationId.findByConversationId(
                input.conversationId,
            );

        return invites.map((invite) => toInviteOutput(invite));
    }
}
