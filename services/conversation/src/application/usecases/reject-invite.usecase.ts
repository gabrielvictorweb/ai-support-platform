import { Injectable, Inject } from '@nestjs/common';
import { InviteStatus } from '../../domain/entities/invite.entity';
import { type IUpdateInviteStatus } from '../ports/output/invite.output';
import {
    type InviteOutput,
    type UpdateInviteStatusDto,
    toInviteOutput,
} from '../dtos';
import { type RejectInviteInput as RejectInviteInputPort } from '../ports/input';

@Injectable()
export class RejectInviteUseCase implements RejectInviteInputPort {
    constructor(
        @Inject('RejectInvite')
        private readonly reject: IUpdateInviteStatus,
    ) {}

    async execute(input: UpdateInviteStatusDto): Promise<InviteOutput | null> {
        const invite = await this.reject.updateStatus(
            input.id,
            InviteStatus.REJECTED,
        );

        return invite ? toInviteOutput(invite) : null;
    }
}
