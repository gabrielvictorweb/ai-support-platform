import { GetInviteDto, InviteOutput } from 'src/application/dtos';

export interface GetInviteInput {
    execute(input: GetInviteDto): Promise<InviteOutput | null>;
}
