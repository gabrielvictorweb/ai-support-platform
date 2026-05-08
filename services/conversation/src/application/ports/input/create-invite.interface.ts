import { CreateInviteInput, InviteOutput } from 'src/application/dtos';

export interface CreateInviteUseCase {
    execute(input: CreateInviteInput): Promise<InviteOutput>;
}
