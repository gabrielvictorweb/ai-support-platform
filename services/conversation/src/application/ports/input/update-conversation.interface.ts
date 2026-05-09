import {
    ConversationOutput,
    UpdateConversationInput,
} from 'src/application/dtos';

export interface UpdateConversationUseCase {
    execute(input: UpdateConversationInput): Promise<ConversationOutput | null>;
}
