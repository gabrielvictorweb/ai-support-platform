import { ConversationOutput, ListConversationsDto } from 'src/application/dtos';

export interface ListConversationsInput {
    execute(input?: ListConversationsDto): Promise<ConversationOutput[]>;
}
