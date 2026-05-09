import {
    ListMessagesByConversationInput,
    MessageConnectionOutput,
} from 'src/application/dtos';

export interface ListMessagesByConversationUseCase {
    execute(
        input: ListMessagesByConversationInput,
    ): Promise<MessageConnectionOutput>;
}
