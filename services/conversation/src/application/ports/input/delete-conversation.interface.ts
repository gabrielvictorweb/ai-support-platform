import {
    DeleteConversationInput,
    DeleteResultOutput,
} from 'src/application/dtos';

export interface DeleteConversationUseCase {
    execute(input: DeleteConversationInput): Promise<DeleteResultOutput>;
}
