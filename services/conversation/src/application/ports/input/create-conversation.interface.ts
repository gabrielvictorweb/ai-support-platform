import {
    ConversationOutput,
    CreateConversationInput,
} from 'src/application/dtos';

export interface CreateConversationUseCase {
    execute(input: CreateConversationInput): Promise<ConversationOutput>;
}
