import { InviteOutput, UpdateInviteStatusDto } from 'src/application/dtos';

export interface AcceptInviteInput {
    execute(input: UpdateInviteStatusDto): Promise<InviteOutput | null>;
}
