import { InviteOutput } from 'src/application/dtos';

export class InvitePresenter {
    static toGrpcResponse(invite: InviteOutput) {
        return {
            invite: {
                id: invite.id,
                conversationId: invite.conversationId,
                userId: invite.userId,
                status: invite.status,
                createdAt: invite.createdAt.toISOString(),
                updatedAt: invite.updatedAt.toISOString(),
            },
        };
    }
}
