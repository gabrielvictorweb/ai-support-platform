import { DeleteMessageInput, DeleteResultOutput } from 'src/application/dtos';

export interface DeleteMessageUseCase {
    execute(input: DeleteMessageInput): Promise<DeleteResultOutput>;
}
