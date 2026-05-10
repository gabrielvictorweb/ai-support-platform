import { CreateMessageDto, MessageOutput } from 'src/application/dtos';

export interface CreateMessageInput {
    execute(input: CreateMessageDto): Promise<MessageOutput>;
}
