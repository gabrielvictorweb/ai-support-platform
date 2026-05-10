import { DeleteMessageDto, DeleteResultOutput } from 'src/application/dtos';

export interface DeleteMessageInput {
    execute(input: DeleteMessageDto): Promise<DeleteResultOutput>;
}
