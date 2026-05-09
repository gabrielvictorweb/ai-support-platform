import { IsUUID } from 'class-validator';

export interface CreateConversationInput {
    participantIds?: string[];
}

export class GetConversationInput {
    @IsUUID()
    id: string;
}

export interface ListConversationsInput {}

export interface UpdateConversationInput {
    id: string;
    participantIds?: string[];
}

export interface DeleteConversationInput {
    id: string;
}
