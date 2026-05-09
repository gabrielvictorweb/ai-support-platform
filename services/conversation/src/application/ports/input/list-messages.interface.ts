import {
    ListMessagesInput,
    MessageConnectionOutput,
} from 'src/application/dtos';

export interface ListMessagesUseCase {
    execute(input?: ListMessagesInput): Promise<MessageConnectionOutput>;
}
