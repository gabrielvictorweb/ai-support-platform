import {
    ListMessagesByConversationDto,
    MessageConnectionOutput,
} from 'src/application/dtos';

export interface ListMessagesByConversationInput {
    execute(
        input: ListMessagesByConversationDto,
    ): Promise<MessageConnectionOutput>;
}
