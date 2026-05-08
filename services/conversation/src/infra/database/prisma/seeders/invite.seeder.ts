import { SeededConversation } from './conversation.seeder';
import { USER_EMAILS } from './participant.seeder';
import { PrismaClient, $Enums } from '@prisma/client';

export type SeededInvite = {
    id: string;
    conversationId: string;
    userId: string;
    status: $Enums.InviteStatus;
};

const INVITE_SEEDS: SeededInvite[] = [
    {
        id: 'invite-general-carol',
        conversationId: 'conv-general',
        userId: USER_EMAILS[2],
        status: $Enums.InviteStatus.PENDING,
    },
    {
        id: 'invite-product-alice',
        conversationId: 'conv-product',
        userId: USER_EMAILS[0],
        status: $Enums.InviteStatus.ACCEPTED,
    },
];

export async function seedInvites(
    prisma: PrismaClient,
    conversations: SeededConversation[],
): Promise<SeededInvite[]> {
    const conversationIds = new Set(conversations.map((item) => item.id));

    for (const invite of INVITE_SEEDS) {
        if (!conversationIds.has(invite.conversationId)) {
            continue;
        }

        await prisma.invite.upsert({
            where: { id: invite.id },
            create: {
                id: invite.id,
                conversationId: invite.conversationId,
                userId: invite.userId,
                status: invite.status,
            },
            update: {
                conversationId: invite.conversationId,
                userId: invite.userId,
                status: invite.status,
            },
        });
    }

    return INVITE_SEEDS;
}
