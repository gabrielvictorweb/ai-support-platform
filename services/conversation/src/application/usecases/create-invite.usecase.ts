import { Injectable, Inject } from '@nestjs/common';
import {
    type CreateInviteInput,
    type InviteOutput,
    toInviteOutput,
} from '../dtos';
import { type CreateInviteUseCase as CreateInviteUseCasePort } from '../ports/input';
import { type ICreateInvite } from '../ports/output/invite.output';

@Injectable()
export class CreateInviteUseCase implements CreateInviteUseCasePort {
    constructor(
        @Inject('CreateInvite')
        private readonly createInvite: ICreateInvite,
    ) {}

    async execute(input: CreateInviteInput): Promise<InviteOutput> {
        const invite = await this.createInvite.create({
            conversationId: input.conversationId,
            userId: input.userId,
        });

        return toInviteOutput(invite);
    }
}
