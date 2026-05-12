import { ConversationPresenter } from '../../../../src/presentation/presenters/conversation.presenter';
import { InvitePresenter } from '../../../../src/presentation/presenters/invite.presenter';
import { MessagePresenter } from '../../../../src/presentation/presenters/message.presenter';
import { MessageConnectionPresenter } from '../../../../src/presentation/presenters/messageConnection.presenter';
import {
    ConversationOutput,
    InviteOutput,
    MessageConnectionOutput,
    MessageOutput,
} from '../../../../src/application/dtos';
import { InviteStatus } from '../../../../src/domain/entities/invite.entity';

describe('Presenters', () => {
    it('should map conversation output to grpc response', () => {
        const conversation: ConversationOutput = {
            id: 'conv-1',
            participantIds: ['user-1'],
            createdAt: new Date('2025-01-01T00:00:00.000Z'),
            updatedAt: new Date('2025-01-02T00:00:00.000Z'),
        };

        const result = ConversationPresenter.toGrpcResponse(conversation);

        expect(result).toEqual({
            conversation: {
                id: 'conv-1',
                participantIds: ['user-1'],
                createdAt: '2025-01-01T00:00:00.000Z',
                updatedAt: '2025-01-02T00:00:00.000Z',
            },
        });
    });

    it('should map conversation output with empty participants', () => {
        const conversation: ConversationOutput = {
            id: 'conv-2',
            createdAt: new Date('2025-01-01T00:00:00.000Z'),
            updatedAt: new Date('2025-01-02T00:00:00.000Z'),
        };

        const result = ConversationPresenter.toGrpcResponse(conversation);

        expect(result).toEqual({
            conversation: {
                id: 'conv-2',
                participantIds: [],
                createdAt: '2025-01-01T00:00:00.000Z',
                updatedAt: '2025-01-02T00:00:00.000Z',
            },
        });
    });

    it('should map invite output to grpc response', () => {
        const invite: InviteOutput = {
            id: 'invite-1',
            conversationId: 'conv-1',
            userId: 'user-1',
            status: InviteStatus.PENDING,
            createdAt: new Date('2025-01-01T00:00:00.000Z'),
            updatedAt: new Date('2025-01-02T00:00:00.000Z'),
        };

        const result = InvitePresenter.toGrpcResponse(invite);

        expect(result).toEqual({
            invite: {
                id: 'invite-1',
                conversationId: 'conv-1',
                userId: 'user-1',
                status: InviteStatus.PENDING,
                createdAt: '2025-01-01T00:00:00.000Z',
                updatedAt: '2025-01-02T00:00:00.000Z',
            },
        });
    });

    it('should map message output to grpc response', () => {
        const message: MessageOutput = {
            id: 'msg-1',
            conversationId: 'conv-1',
            content: 'hello',
            createdAt: new Date('2025-01-01T00:00:00.000Z'),
            updatedAt: new Date('2025-01-02T00:00:00.000Z'),
        };

        const result = MessagePresenter.toGrpcResponse(message);

        expect(result).toEqual({
            message: {
                id: 'msg-1',
                conversationId: 'conv-1',
                content: 'hello',
                createdAt: '2025-01-01T00:00:00.000Z',
                updatedAt: '2025-01-02T00:00:00.000Z',
            },
        });
    });

    it('should map message connection output to grpc response', () => {
        const message: MessageOutput = {
            id: 'msg-1',
            conversationId: 'conv-1',
            content: 'hello',
            createdAt: new Date('2025-01-01T00:00:00.000Z'),
            updatedAt: new Date('2025-01-02T00:00:00.000Z'),
        };

        const connection: MessageConnectionOutput = {
            items: [message],
            nextCursor: null,
            hasNextPage: true,
        };

        const result = MessageConnectionPresenter.toGrpcResponse(connection);

        expect(result).toEqual({
            items: [
                {
                    id: 'msg-1',
                    conversationId: 'conv-1',
                    content: 'hello',
                    createdAt: '2025-01-01T00:00:00.000Z',
                    updatedAt: '2025-01-02T00:00:00.000Z',
                },
            ],
            nextCursor: '',
            hasNextPage: true,
        });
    });
});
