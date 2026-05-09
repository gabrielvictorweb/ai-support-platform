import { Conversation } from '../../domain/entities/conversation.entity';

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
