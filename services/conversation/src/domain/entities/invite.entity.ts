export enum InviteStatus {
    PENDING = 'PENDING',
    ACCEPTED = 'ACCEPTED',
    REJECTED = 'REJECTED',
}

export class Invite {
    id: string;

    conversationId: string;

    userId: string;

    status: InviteStatus;

    createdAt: Date;

    updatedAt: Date;
}
