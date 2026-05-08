export interface CreateInviteInput {
    conversationId: string;
    userId: string;
}

export interface GetInviteInput {
    id: string;
}

export interface ListInvitesByConversationInput {
    conversationId: string;
}

export interface UpdateInviteStatusInput {
    id: string;
}
