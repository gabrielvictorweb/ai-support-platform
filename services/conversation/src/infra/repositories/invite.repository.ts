import { Injectable } from '@nestjs/common';
import { Invite, InviteStatus } from '../../domain/entities/invite.entity';
import { PrismaService } from '../database/prisma/prisma.service';
import {
    ICreateInvite,
    IDeleteInvite,
    IFindInviteById,
    IFindInvitesByConversationId,
    IUpdateInviteStatus,
} from 'src/application/ports/output/invite.output';

@Injectable()
export class InviteRepository
    implements
        ICreateInvite,
        IFindInviteById,
        IFindInvitesByConversationId,
        IUpdateInviteStatus,
        IDeleteInvite
{
    constructor(private readonly prisma: PrismaService) {}

    async create(
        data: Omit<Invite, 'id' | 'status' | 'createdAt' | 'updatedAt'>,
    ): Promise<Invite> {
        const created = await this.prisma.invite.create({
            data: {
                conversationId: data.conversationId,
                userId: data.userId,
                status: 'PENDING',
            },
        });

        return {
            id: created.id,
            conversationId: created.conversationId,
            userId: created.userId,
            status: created.status as InviteStatus,
            createdAt: created.createdAt,
            updatedAt: created.updatedAt,
        };
    }

    async findById(id: string): Promise<Invite | null> {
        const found = await this.prisma.invite.findUnique({ where: { id } });
        if (!found) return null;

        return {
            id: found.id,
            conversationId: found.conversationId,
            userId: found.userId,
            status: found.status as InviteStatus,
            createdAt: found.createdAt,
            updatedAt: found.updatedAt,
        };
    }

    async findByConversationId(conversationId: string): Promise<Invite[]> {
        const items = await this.prisma.invite.findMany({
            where: { conversationId },
        });

        return items.map((item) => ({
            id: item.id,
            conversationId: item.conversationId,
            userId: item.userId,
            status: item.status as InviteStatus,
            createdAt: item.createdAt,
            updatedAt: item.updatedAt,
        }));
    }

    async updateStatus(
        id: string,
        status: InviteStatus,
    ): Promise<Invite | null> {
        try {
            const updated = await this.prisma.invite.update({
                where: { id },
                data: { status },
            });

            return {
                id: updated.id,
                conversationId: updated.conversationId,
                userId: updated.userId,
                status: updated.status as InviteStatus,
                createdAt: updated.createdAt,
                updatedAt: updated.updatedAt,
            };
        } catch {
            return null;
        }
    }

    async delete(id: string): Promise<boolean> {
        try {
            await this.prisma.invite.delete({ where: { id } });
            return true;
        } catch {
            return false;
        }
    }
}
