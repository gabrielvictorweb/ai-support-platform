import {
    InviteOutput,
    ListInvitesByConversationDto,
} from 'src/application/dtos';

export interface ListInvitesByConversationInput {
    execute(input: ListInvitesByConversationDto): Promise<InviteOutput[]>;
}
