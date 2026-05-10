import { PrismaClient } from '@prisma/client';
import { SeededConversation } from './conversation.seeder';

export type SeededParticipant = {
    id: string;
    conversationId: string;
    userId: string;
};

export const USER_EMAILS = [
    'alice.seed@closedchat.dev',
    'bob.seed@closedchat.dev',
    'carol.seed@closedchat.dev',
] as const;

const PARTICIPANT_SEEDS: SeededParticipant[] = [
    {
        id: 'part-general-alice',
        conversationId: 'conv-general',
        userId: USER_EMAILS[0],
    },
    {
        id: 'part-general-bob',
        conversationId: 'conv-general',
        userId: USER_EMAILS[1],
    },
    {
        id: 'part-product-bob',
        conversationId: 'conv-product',
        userId: USER_EMAILS[1],
    },
    {
        id: 'part-product-carol',
        conversationId: 'conv-product',
        userId: USER_EMAILS[2],
    },
];

export async function seedParticipants(
    prisma: PrismaClient,
    conversations: SeededConversation[],
): Promise<SeededParticipant[]> {
    const conversationIds = new Set(conversations.map((item) => item.id));

    for (const participant of PARTICIPANT_SEEDS) {
        if (!conversationIds.has(participant.conversationId)) {
            continue;
        }

        await prisma.participant.upsert({
            where: { id: participant.id },
            create: {
                id: participant.id,
                conversationId: participant.conversationId,
                userId: participant.userId,
            },
            update: {
                conversationId: participant.conversationId,
                userId: participant.userId,
            },
        });
    }

    return PARTICIPANT_SEEDS;
}
