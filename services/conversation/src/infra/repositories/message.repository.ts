import { Injectable } from '@nestjs/common';
import { Message } from '../../domain/entities/message.entity';
import {
    type ICreateMessage,
    type IDeleteMessage,
    type IFindMessageById,
    type IFindMessages,
    type IFindMessagesByConversationId,
    type IUpdateMessage,
    type MessageCursorPaginationInput,
    type MessageCursorPaginationResult,
} from '../../application/ports/output/message.repository';
import { PrismaService } from '../database/prisma/prisma.service';

@Injectable()
export class MessageRepository
    implements
        ICreateMessage,
        IFindMessageById,
        IFindMessagesByConversationId,
        IFindMessages,
        IUpdateMessage,
        IDeleteMessage
{
    constructor(private readonly prisma: PrismaService) {}

    private mapMessage(item: {
        id: string;
        conversationId: string;
        content: string;
        createdAt: Date;
        updatedAt: Date;
    }): Message {
        return {
            id: item.id,
            conversationId: item.conversationId,
            content: item.content,
            createdAt: item.createdAt,
            updatedAt: item.updatedAt,
        };
    }

    private toCursorPaginationResult(
        items: Message[],
        limit: number,
    ): MessageCursorPaginationResult {
        const hasNextPage = items.length > limit;
        const pagedItems = hasNextPage ? items.slice(0, limit) : items;

        return {
            items: pagedItems,
            nextCursor: hasNextPage
                ? (pagedItems[pagedItems.length - 1]?.id ?? null)
                : null,
            hasNextPage,
        };
    }

    async create(message: Omit<Message, 'id'>): Promise<Message> {
        const created = await this.prisma.message.create({
            data: {
                conversationId: message.conversationId,
                content: message.content,
                createdAt: message.createdAt ?? new Date(),
                updatedAt: message.updatedAt ?? new Date(),
            },
        });

        return this.mapMessage(created);
    }

    async findById(id: string): Promise<Message | null> {
        const found = await this.prisma.message.findUnique({
            where: { id },
        });

        if (!found) {
            return null;
        }

        return this.mapMessage(found);
    }

    async findByConversationId(
        conversationId: string,
        pagination: MessageCursorPaginationInput,
    ): Promise<MessageCursorPaginationResult> {
        const take = pagination.limit + 1;

        const items = await this.prisma.message.findMany({
            where: { conversationId },
            orderBy: [{ createdAt: 'desc' }, { id: 'desc' }],
            ...(pagination.cursor
                ? {
                      cursor: { id: pagination.cursor },
                      skip: 1,
                  }
                : {}),
            take,
        });

        return this.toCursorPaginationResult(
            items.map((item) => this.mapMessage(item)),
            pagination.limit,
        );
    }

    async findAll(
        pagination: MessageCursorPaginationInput,
    ): Promise<MessageCursorPaginationResult> {
        const take = pagination.limit + 1;

        const items = await this.prisma.message.findMany({
            orderBy: [{ createdAt: 'desc' }, { id: 'desc' }],
            ...(pagination.cursor
                ? {
                      cursor: { id: pagination.cursor },
                      skip: 1,
                  }
                : {}),
            take,
        });

        return this.toCursorPaginationResult(
            items.map((item) => this.mapMessage(item)),
            pagination.limit,
        );
    }

    async update(id: string, data: Partial<Message>): Promise<Message | null> {
        try {
            const updated = await this.prisma.message.update({
                where: { id },
                data: {
                    content: data.content,
                    updatedAt: new Date(),
                },
            });

            return this.mapMessage(updated);
        } catch {
            return null;
        }
    }

    async delete(id: string): Promise<boolean> {
        try {
            await this.prisma.message.delete({
                where: { id },
            });
            return true;
        } catch {
            return false;
        }
    }
}
