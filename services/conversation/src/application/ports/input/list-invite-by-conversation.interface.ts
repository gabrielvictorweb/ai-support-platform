import {
    InviteOutput,
    ListInvitesByConversationInput,
} from 'src/application/dtos';

export interface ListInvitesByConversationUseCase {
    execute(input: ListInvitesByConversationInput): Promise<InviteOutput[]>;
}
