import { Injectable } from '@nestjs/common';
import { Conversation } from '../../domain/entities/conversation.entity';
import {
    type ICreateConversation,
    type IDeleteConversation,
    type IFindConversationById,
    type IFindConversations,
    type IUpdateConversation,
} from '../../application/ports/output/conversation.output';
import { PrismaService } from '../database/prisma/prisma.service';

@Injectable()
export class ConversationRepository
    implements
        ICreateConversation,
        IFindConversationById,
        IFindConversations,
        IUpdateConversation,
        IDeleteConversation
{
    constructor(private readonly prisma: PrismaService) {}

    private get participantModel(): {
        findMany(args: {
            where: { conversationId: string };
        }): Promise<Array<{ userId: string }>>;
        createMany(args: {
            data: Array<{ conversationId: string; userId: string }>;
        }): Promise<unknown>;
        deleteMany(args: {
            where: { conversationId: string };
        }): Promise<unknown>;
    } {
        return (
            this.prisma as unknown as {
                participant: {
                    findMany(args: {
                        where: { conversationId: string };
                    }): Promise<Array<{ userId: string }>>;
                    createMany(args: {
                        data: Array<{ conversationId: string; userId: string }>;
                    }): Promise<unknown>;
                    deleteMany(args: {
                        where: { conversationId: string };
                    }): Promise<unknown>;
                };
            }
        ).participant;
    }

    async create(
        conversation: Omit<Conversation, 'id'>,
    ): Promise<Conversation> {
        const participantIds = Array.from(
            new Set(conversation.participantIds ?? []),
        );

        const created = await this.prisma.conversation.create({
            data: {
                createdAt: conversation.createdAt ?? new Date(),
                updatedAt: conversation.updatedAt ?? new Date(),
            },
        });

        if (participantIds.length > 0) {
            await this.participantModel.createMany({
                data: participantIds.map((userId) => ({
                    conversationId: created.id,
                    userId,
                })),
            });
        }

        return {
            id: created.id,
            participantIds,
            createdAt: created.createdAt,
            updatedAt: created.updatedAt,
        };
    }

    async findById(id: string): Promise<Conversation | null> {
        const found = await this.prisma.conversation.findUnique({
            where: { id },
        });

        if (!found) {
            return null;
        }

        const participants = await this.participantModel.findMany({
            where: { conversationId: id },
        });

        return {
            id: found.id,
            participantIds: participants.map(
                (participant) => participant.userId,
            ),
            createdAt: found.createdAt,
            updatedAt: found.updatedAt,
        };
    }

    async findAll(): Promise<Conversation[]> {
        const items = await this.prisma.conversation.findMany();

        return Promise.all(
            items.map(async (item) => {
                const participants = await this.participantModel.findMany({
                    where: { conversationId: item.id },
                });

                return {
                    id: item.id,
                    participantIds: participants.map(
                        (participant) => participant.userId,
                    ),
                    createdAt: item.createdAt,
                    updatedAt: item.updatedAt,
                };
            }),
        );
    }

    async update(
        id: string,
        data: Partial<Conversation>,
    ): Promise<Conversation | null> {
        const participantIds = data.participantIds
            ? Array.from(new Set(data.participantIds))
            : undefined;

        try {
            const updated = await this.prisma.conversation.update({
                where: { id },
                data: {
                    updatedAt: new Date(),
                },
            });

            if (participantIds !== undefined) {
                await this.participantModel.deleteMany({
                    where: { conversationId: id },
                });

                if (participantIds.length > 0) {
                    await this.participantModel.createMany({
                        data: participantIds.map((userId) => ({
                            conversationId: id,
                            userId,
                        })),
                    });
                }
            }

            const participants = await this.participantModel.findMany({
                where: { conversationId: id },
            });

            return {
                id: updated.id,
                participantIds: participants.map(
                    (participant) => participant.userId,
                ),
                createdAt: updated.createdAt,
                updatedAt: updated.updatedAt,
            };
        } catch {
            return null;
        }
    }

    async delete(id: string): Promise<boolean> {
        try {
            await this.prisma.conversation.delete({
                where: { id },
            });
            return true;
        } catch {
            return false;
        }
    }
}
