import { CreateInviteDto, InviteOutput } from 'src/application/dtos';

export interface CreateInviteInput {
    execute(input: CreateInviteDto): Promise<InviteOutput>;
}
