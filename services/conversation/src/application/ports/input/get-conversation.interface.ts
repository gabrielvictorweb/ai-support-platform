import { ConversationOutput, GetConversationInput } from 'src/application/dtos';

export interface GetConversationUseCase {
    execute(input: GetConversationInput): Promise<ConversationOutput | null>;
}
