import { PrismaClient } from '@prisma/client';

export type SeededConversation = {
    id: string;
};

const CONVERSATION_SEEDS: SeededConversation[] = [
    { id: 'conv-general' },
    { id: 'conv-product' },
];

export async function seedConversations(
    prisma: PrismaClient,
): Promise<SeededConversation[]> {
    for (const conversation of CONVERSATION_SEEDS) {
        await prisma.conversation.upsert({
            where: { id: conversation.id },
            create: { id: conversation.id },
            update: {},
        });
    }

    return CONVERSATION_SEEDS;
}
