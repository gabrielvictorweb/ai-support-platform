import { InviteOutput, UpdateInviteStatusInput } from 'src/application/dtos';

export interface RejectInviteUseCase {
    execute(input: UpdateInviteStatusInput): Promise<InviteOutput | null>;
}
