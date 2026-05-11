import { MessageOutput, UpdateMessageDto } from 'src/application/dtos';

export interface UpdateMessageInput {
    execute(input: UpdateMessageDto): Promise<MessageOutput | null>;
}
