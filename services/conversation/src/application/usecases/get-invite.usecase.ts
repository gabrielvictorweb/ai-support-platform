import { Injectable, Inject } from '@nestjs/common';
import { type IFindInviteById } from '../ports/output/invite.output';
import { type GetInviteDto, type InviteOutput, toInviteOutput } from '../dtos';
import { type GetInviteInput as GetInviteInputPort } from '../ports/input';

@Injectable()
export class GetInviteUseCase implements GetInviteInputPort {
    constructor(
        @Inject('FindInviteById')
        private readonly findInvite: IFindInviteById,
    ) {}

    async execute(input: GetInviteDto): Promise<InviteOutput | null> {
        const invite = await this.findInvite.findById(input.id);

        if (!invite) {
            return null;
        }

        return toInviteOutput(invite);
    }
}
