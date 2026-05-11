import {
    ConversationOutput,
    UpdateConversationDto,
} from 'src/application/dtos';

export interface UpdateConversationInput {
    execute(input: UpdateConversationDto): Promise<ConversationOutput | null>;
}
