import { Injectable, Inject } from '@nestjs/common';
import { InviteStatus } from '../../domain/entities/invite.entity';
import { type IUpdateInviteStatus } from '../ports/output/invite.output';
import {
    type InviteOutput,
    type UpdateInviteStatusDto,
    toInviteOutput,
} from '../dtos';
import { type AcceptInviteInput as AcceptInviteInputPort } from '../ports/input';

@Injectable()
export class AcceptInviteUseCase implements AcceptInviteInputPort {
    constructor(
        @Inject('AcceptInvite')
        private readonly acceptInvite: IUpdateInviteStatus,
    ) {}

    async execute(
        input: UpdateInviteStatusDto,
    ): Promise<InviteOutput | null> {
        const invite = await this.acceptInvite.updateStatus(
            input.id,
            InviteStatus.ACCEPTED,
        );

        if (!invite) return null;

        return toInviteOutput(invite);
    }
}
