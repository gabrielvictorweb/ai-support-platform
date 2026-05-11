import { ConversationOutput } from 'src/application/dtos';

export class ConversationPresenter {
    static toGrpcResponse(conversation: ConversationOutput) {
        return {
            conversation: {
                id: conversation.id,
                participantIds: conversation.participantIds ?? [],
                createdAt: conversation.createdAt.toISOString(),
                updatedAt: conversation.updatedAt.toISOString(),
            },
        };
    }
}
