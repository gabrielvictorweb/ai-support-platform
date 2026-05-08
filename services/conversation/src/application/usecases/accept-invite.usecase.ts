import { Injectable, Inject } from '@nestjs/common';
import { InviteStatus } from '../../domain/entities/invite.entity';
import { type IUpdateInviteStatus } from '../ports/output/invite.output';
import {
    type InviteOutput,
    type UpdateInviteStatusInput,
    toInviteOutput,
} from '../dtos';
import { type AcceptInviteUseCase as AcceptInviteUseCasePort } from '../ports/input';

@Injectable()
export class AcceptInviteUseCase implements AcceptInviteUseCasePort {
    constructor(
        @Inject('AcceptInvite')
        private readonly acceptInvite: IUpdateInviteStatus,
    ) {}

    async execute(
        input: UpdateInviteStatusInput,
    ): Promise<InviteOutput | null> {
        const invite = await this.acceptInvite.updateStatus(
            input.id,
            InviteStatus.ACCEPTED,
        );

        return invite ? toInviteOutput(invite) : null;
    }
}
