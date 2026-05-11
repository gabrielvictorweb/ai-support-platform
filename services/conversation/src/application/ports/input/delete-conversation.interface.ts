import {
    DeleteConversationDto,
    DeleteResultOutput,
} from 'src/application/dtos';

export interface DeleteConversationInput {
    execute(input: DeleteConversationDto): Promise<DeleteResultOutput>;
}
