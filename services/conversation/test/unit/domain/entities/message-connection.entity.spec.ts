import { MessageConnection } from '../../../../src/domain/entities/message-connection.entity';
import { Message } from '../../../../src/domain/entities/message.entity';

describe('MessageConnection Entity', () => {
    it('should create a message connection with items and pagination', () => {
        const message = new Message();
        message.id = 'msg-1';
        message.conversationId = 'conv-1';
        message.content = 'Test';
        message.createdAt = new Date();
        message.updatedAt = new Date();

        const connection = new MessageConnection();
        connection.items = [message];
        connection.nextCursor = 'msg-1';
        connection.hasNextPage = true;

        expect(connection.items).toHaveLength(1);
        expect(connection.items[0]?.id).toBe('msg-1');
        expect(connection.nextCursor).toBe('msg-1');
        expect(connection.hasNextPage).toBe(true);
    });
});
