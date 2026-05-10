import {
    ConversationOutput,
    CreateConversationDto,
} from 'src/application/dtos';

export interface CreateConversationInput {
    execute(input: CreateConversationDto): Promise<ConversationOutput>;
}
