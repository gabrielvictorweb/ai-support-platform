import { GetMessageDto, MessageOutput } from 'src/application/dtos';

export interface GetMessageInput {
    execute(input: GetMessageDto): Promise<MessageOutput>;
}
