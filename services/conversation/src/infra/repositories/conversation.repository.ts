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

type ParticipantModel = {
    findMany(args: {
        where: { conversationId: string };
    }): Promise<Array<{ userId: string }>>;
    createMany(args: {
        data: Array<{ conversationId: string; userId: string }>;
    }): Promise<unknown>;
    deleteMany(args: { where: { conversationId: string } }): Promise<unknown>;
};

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

    private participantsOn(client: unknown): ParticipantModel {
        return (client as { participant: ParticipantModel }).participant;
    }

    private get writerParticipants(): ParticipantModel {
        return this.participantsOn(this.prisma.client);
    }

    private get readerParticipants(): ParticipantModel {
        return this.participantsOn(this.prisma.client.$replica());
    }

    async create(
        conversation: Omit<Conversation, 'id'>,
    ): Promise<Conversation> {
        const participantIds = Array.from(
            new Set(conversation.participantIds ?? []),
        );

        const created = await this.prisma.client.conversation.create({
            data: {
                createdAt: conversation.createdAt ?? new Date(),
                updatedAt: conversation.updatedAt ?? new Date(),
            },
        });

        if (participantIds.length > 0) {
            await this.writerParticipants.createMany({
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
        const found = await this.prisma.client
            .$replica()
            .conversation.findUnique({
                where: { id },
            });

        if (!found) {
            return null;
        }

        const participants = await this.readerParticipants.findMany({
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
        const items = await this.prisma.client
            .$replica()
            .conversation.findMany();

        return Promise.all(
            items.map(async (item) => {
                const participants = await this.readerParticipants.findMany({
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
            const updated = await this.prisma.client.conversation.update({
                where: { id },
                data: {
                    updatedAt: new Date(),
                },
            });

            if (participantIds !== undefined) {
                await this.writerParticipants.deleteMany({
                    where: { conversationId: id },
                });

                if (participantIds.length > 0) {
                    await this.writerParticipants.createMany({
                        data: participantIds.map((userId) => ({
                            conversationId: id,
                            userId,
                        })),
                    });
                }
            }

            // Lê do primary para não ver lista incompleta por lag de replicação.
            const participants = await this.writerParticipants.findMany({
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
            await this.prisma.client.conversation.delete({
                where: { id },
            });
            return true;
        } catch {
            return false;
        }
    }
}
