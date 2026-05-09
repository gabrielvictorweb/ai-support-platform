import { PrismaClient } from '@prisma/client';
import { SeededConversation } from './conversation.seeder';
import { USER_EMAILS } from './participant.seeder';

export type SeededMessage = {
    id: string;
    conversationId: string;
    userId: string;
    content: string;
};

const MESSAGE_SEEDS: SeededMessage[] = [
    {
        id: 'msg-general-1',
        conversationId: 'conv-general',
        userId: USER_EMAILS[0],
        content: 'Olá pessoal, bem-vindos ao canal geral.',
    },
    {
        id: 'msg-general-2',
        conversationId: 'conv-general',
        userId: USER_EMAILS[1],
        content: 'Obrigado! Já vou revisar os últimos tópicos.',
    },
    {
        id: 'msg-product-1',
        conversationId: 'conv-product',
        userId: USER_EMAILS[1],
        content: 'Precisamos alinhar os próximos incrementos do produto.',
    },
    {
        id: 'msg-product-2',
        conversationId: 'conv-product',
        userId: USER_EMAILS[2],
        content: 'Perfeito, posso preparar o resumo para o sprint planning.',
    },
];

export async function seedMessages(
    prisma: PrismaClient,
    conversations: SeededConversation[],
): Promise<SeededMessage[]> {
    const conversationIds = new Set(conversations.map((item) => item.id));

    for (const message of MESSAGE_SEEDS) {
        if (!conversationIds.has(message.conversationId)) {
            continue;
        }

        await prisma.message.upsert({
            where: { id: message.id },
            create: {
                id: message.id,
                conversationId: message.conversationId,
                content: `[${message.userId}] ${message.content}`,
            },
            update: {
                conversationId: message.conversationId,
                content: `[${message.userId}] ${message.content}`,
            },
        });
    }

    return MESSAGE_SEEDS;
}
