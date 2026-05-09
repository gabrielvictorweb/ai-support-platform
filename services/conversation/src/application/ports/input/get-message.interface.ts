import { GetMessageInput, MessageOutput } from 'src/application/dtos';

export interface GetMessageUseCase {
    execute(input: GetMessageInput): Promise<MessageOutput>;
}
