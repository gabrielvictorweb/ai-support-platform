import { Injectable, Inject } from '@nestjs/common';
import { type IFindInviteById } from '../ports/output/invite.output';
import {
    type GetInviteInput,
    type InviteOutput,
    toInviteOutput,
} from '../dtos';
import { type GetInviteUseCase as GetInviteUseCasePort } from '../ports/input';

@Injectable()
export class GetInviteUseCase implements GetInviteUseCasePort {
    constructor(
        @Inject('FindInviteById')
        private readonly findInvite: IFindInviteById,
    ) {}

    async execute(input: GetInviteInput): Promise<InviteOutput | null> {
        const invite = await this.findInvite.findById(input.id);

        if (!invite) {
            return null;
        }

        return toInviteOutput(invite);
    }
}
