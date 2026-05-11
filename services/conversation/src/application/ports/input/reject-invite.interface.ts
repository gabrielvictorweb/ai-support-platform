import { InviteOutput, UpdateInviteStatusDto } from 'src/application/dtos';

export interface RejectInviteInput {
    execute(input: UpdateInviteStatusDto): Promise<InviteOutput | null>;
}
