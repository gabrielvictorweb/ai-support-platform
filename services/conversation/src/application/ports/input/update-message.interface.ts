import { MessageOutput, UpdateMessageInput } from 'src/application/dtos';

export interface UpdateMessageUseCase {
    execute(input: UpdateMessageInput): Promise<MessageOutput | null>;
}
