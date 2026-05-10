import { Injectable, Inject } from '@nestjs/common';
import {
    type CreateInviteDto,
    type InviteOutput,
    toInviteOutput,
} from '../dtos';
import { type CreateInviteInput as CreateInviteInputPort } from '../ports/input';
import { type ICreateInvite } from '../ports/output/invite.output';

@Injectable()
export class CreateInviteUseCase implements CreateInviteInputPort {
    constructor(
        @Inject('CreateInvite')
        private readonly createInvite: ICreateInvite,
    ) {}

    async execute(input: CreateInviteDto): Promise<InviteOutput> {
        const invite = await this.createInvite.create({
            conversationId: input.conversationId,
            userId: input.userId,
        });

        return toInviteOutput(invite);
    }
}
