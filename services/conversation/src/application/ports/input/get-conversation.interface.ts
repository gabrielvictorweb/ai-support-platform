import { ConversationOutput, GetConversationDto } from 'src/application/dtos';

export interface GetConversationInput {
    execute(input: GetConversationDto): Promise<ConversationOutput | null>;
}
