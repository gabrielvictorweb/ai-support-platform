import { Pool } from 'pg';
import { PrismaClient } from '@prisma/client';

export type SeedUser = {
    id: string;
    name: string;
};

/**
 * Lê todos os usuários diretamente do banco do user-service.
 *
 * A seed de conversas precisa conhecer os usuários reais (o `userId` de um
 * Participant é casado com o `id` do usuário no user-service), mas os serviços
 * têm bancos separados. Em vez de subir o stack gRPC só para a seed, abrimos
 * uma conexão de leitura ao `user_db` definida em `USER_DATABASE_URL`.
 */
export async function fetchAllUsers(): Promise<SeedUser[]> {
    const connectionString = process.env.USER_DATABASE_URL;

    if (!connectionString) {
        throw new Error(
            'USER_DATABASE_URL não configurado. É necessário para seedar conversas a partir dos usuários reais.',
        );
    }

    const pool = new Pool({ connectionString });

    try {
        const result = await pool.query<SeedUser>(
            'SELECT id::text AS id, name FROM users ORDER BY name',
        );
        return result.rows;
    } finally {
        await pool.end();
    }
}

/**
 * Cria (idempotentemente) uma conversa para cada usuário do banco, com o
 * próprio usuário como participante e uma mensagem de boas-vindas. Os ids são
 * derivados do id do usuário para que reexecuções façam upsert em vez de
 * duplicar.
 */
export async function seedUserConversations(
    prisma: PrismaClient,
    users: SeedUser[],
): Promise<number> {
    if (users.length === 0) {
        console.warn(
            'Nenhum usuário encontrado no user_db — nenhuma conversa foi seedada.',
        );
        return 0;
    }

    for (const user of users) {
        const conversationId = `conv-user-${user.id}`;
        const participantId = `part-user-${user.id}`;
        const messageId = `msg-welcome-${user.id}`;

        await prisma.conversation.upsert({
            where: { id: conversationId },
            create: { id: conversationId },
            update: {},
        });

        await prisma.participant.upsert({
            where: { id: participantId },
            create: {
                id: participantId,
                conversationId,
                userId: user.id,
            },
            update: {
                conversationId,
                userId: user.id,
            },
        });

        await prisma.message.upsert({
            where: { id: messageId },
            create: {
                id: messageId,
                conversationId,
                content: `Olá ${user.name}, bem-vindo(a) à sua conversa!`,
            },
            update: {
                conversationId,
                content: `Olá ${user.name}, bem-vindo(a) à sua conversa!`,
            },
        });
    }

    console.log(`Conversas seedadas para ${users.length} usuário(s).`);
    return users.length;
}
