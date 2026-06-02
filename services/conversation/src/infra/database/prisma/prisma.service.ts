import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from '@prisma/client';
import { readReplicas } from '@prisma/extension-read-replicas';

function buildPrismaClient(connectionString: string): PrismaClient {
    if (connectionString.startsWith('prisma+postgres://')) {
        return new PrismaClient({ accelerateUrl: connectionString });
    }
    return new PrismaClient({ adapter: new PrismaPg(connectionString) });
}

function buildClient() {
    const connectionString = process.env.DATABASE_URL;

    if (!connectionString) {
        throw new Error(
            'DATABASE_URL is not set. Configure it before starting the application.',
        );
    }

    const primary = buildPrismaClient(connectionString);

    // Quando DATABASE_REPLICA_URL não está setada, aponta o "replica" para o
    // próprio primary — preserva o tipo estendido (com $replica()) e mantém o
    // comportamento single-instance no dev local.
    const replicaUrl = process.env.DATABASE_REPLICA_URL ?? connectionString;
    const replica = buildPrismaClient(replicaUrl);

    return primary.$extends(readReplicas({ replicas: [replica] }));
}

@Injectable()
export class PrismaService implements OnModuleInit, OnModuleDestroy {
    public readonly client: ReturnType<typeof buildClient>;

    constructor() {
        this.client = buildClient();
    }

    async onModuleInit() {
        await this.client.$connect();
    }

    async onModuleDestroy() {
        await this.client.$disconnect();
    }
}
