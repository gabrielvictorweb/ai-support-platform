import { Conversation } from '../../domain/entities/conversation.entity';
import { IsUUID } from 'class-validator';

export interface ConversationOutput {
    id: string;
    participantIds?: string[];
    createdAt: Date;
    updatedAt: Date;
}

export const toConversationOutput = (
    conversation: Conversation,
): ConversationOutput => ({
    id: conversation.id,
    participantIds: conversation.participantIds,
    createdAt: conversation.createdAt,
    updatedAt: conversation.updatedAt,
});

export interface CreateConversationDto {
    participantIds?: string[];
}

export class GetConversationDto {
    @IsUUID()
    id: string;
}

export interface ListConversationsDto {}

export interface UpdateConversationDto {
    id: string;
    participantIds?: string[];
}

export interface DeleteConversationDto {
    id: string;
}
