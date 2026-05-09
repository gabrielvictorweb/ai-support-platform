import {
    ConversationOutput,
    ListConversationsInput,
} from 'src/application/dtos';

export interface ListConversationsUseCase {
    execute(input?: ListConversationsInput): Promise<ConversationOutput[]>;
}
