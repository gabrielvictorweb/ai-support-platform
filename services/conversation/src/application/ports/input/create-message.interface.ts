import { CreateMessageInput, MessageOutput } from 'src/application/dtos';

export interface CreateMessageUseCase {
    execute(input: CreateMessageInput): Promise<MessageOutput>;
}
