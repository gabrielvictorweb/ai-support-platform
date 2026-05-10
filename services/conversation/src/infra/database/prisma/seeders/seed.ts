import 'dotenv/config';
import { PrismaPg } from '@prisma/adapter-pg';
import { seedConversations } from './conversation.seeder';
import { seedParticipants } from './participant.seeder';
import { seedInvites } from './invite.seeder';
import { seedMessages } from './message.seeder';
import { PrismaClient } from '@prisma/client';

function createPrismaClient(): PrismaClient {
    const connectionString = process.env.DATABASE_URL;

    if (!connectionString) {
        throw new Error('DATABASE_URL não configurado para execução da seed.');
    }

    if (connectionString.startsWith('prisma+postgres://')) {
        return new PrismaClient({ accelerateUrl: connectionString });
    }

    const adapter = new PrismaPg(connectionString);
    return new PrismaClient({ adapter });
}

async function main() {
    const prisma = createPrismaClient();

    try {
        await prisma.$connect();

        const conversations = await seedConversations(prisma);
        await seedParticipants(prisma, conversations);
        await seedInvites(prisma, conversations);
        await seedMessages(prisma, conversations);

        console.log('Seed concluída com sucesso.');
    } finally {
        await prisma.$disconnect();
    }
}

main().catch((error) => {
    console.error('Erro ao executar seed:', error);
    process.exit(1);
});
