import { Injectable, Inject } from '@nestjs/common';
import { InviteStatus } from '../../domain/entities/invite.entity';
import { type IUpdateInviteStatus } from '../ports/output/invite.output';
import {
    type InviteOutput,
    type UpdateInviteStatusInput,
    toInviteOutput,
} from '../dtos';
import { type RejectInviteUseCase as RejectInviteUseCasePort } from '../ports/input';

@Injectable()
export class RejectInviteUseCase implements RejectInviteUseCasePort {
    constructor(
        @Inject('RejectInvite')
        private readonly reject: IUpdateInviteStatus,
    ) {}

    async execute(
        input: UpdateInviteStatusInput,
    ): Promise<InviteOutput | null> {
        const invite = await this.reject.updateStatus(
            input.id,
            InviteStatus.REJECTED,
        );

        return invite ? toInviteOutput(invite) : null;
    }
}
