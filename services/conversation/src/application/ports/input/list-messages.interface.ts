import { ListMessagesDto, MessageConnectionOutput } from 'src/application/dtos';

export interface ListMessagesInput {
    execute(input?: ListMessagesDto): Promise<MessageConnectionOutput>;
}
