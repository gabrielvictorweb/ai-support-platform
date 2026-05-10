import { Conversation } from 'src/domain/entities/conversation.entity';

export interface ICreateConversation {
    create(conversation: Omit<Conversation, 'id'>): Promise<Conversation>;
}

export interface IFindConversationById {
    findById(id: string): Promise<Conversation | null>;
}

export interface IFindConversations {
    findAll(): Promise<Conversation[]>;
}

export interface IUpdateConversation {
    update(
        id: string,
        data: Partial<Conversation>,
    ): Promise<Conversation | null>;
}

export interface IDeleteConversation {
    delete(id: string): Promise<boolean>;
}
