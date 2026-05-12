import { MessageOutput } from 'src/application/dtos';

export class MessagePresenter {
    static toGrpcResponse(message: MessageOutput) {
        return {
            message: {
                id: message.id,
                conversationId: message.conversationId,
                content: message.content,
                createdAt: message.createdAt.toISOString(),
                updatedAt: message.updatedAt.toISOString(),
            },
        };
    }
}
