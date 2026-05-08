import { InviteOutput, UpdateInviteStatusInput } from 'src/application/dtos';

export interface AcceptInviteUseCase {
    execute(input: UpdateInviteStatusInput): Promise<InviteOutput | null>;
}
