import { Invite, InviteStatus } from '../../domain/entities/invite.entity';

export interface InviteOutput {
    id: string;
    conversationId: string;
    userId: string;
    status: InviteStatus;
    createdAt: Date;
    updatedAt: Date;
}

export const toInviteOutput = (invite: Invite): InviteOutput => ({
    id: invite.id,
    conversationId: invite.conversationId,
    userId: invite.userId,
    status: invite.status,
    createdAt: invite.createdAt,
    updatedAt: invite.updatedAt,
});
