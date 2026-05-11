import { Message } from '../../../../src/domain/entities/message.entity';

describe('Message Entity', () => {
    it('should create a message instance with valid properties', () => {
        const id = 'msg-1';
        const conversationId = 'conv-1';
        const content = 'Test message content';
        const createdAt = new Date();
        const updatedAt = new Date();

        const message = new Message();
        message.id = id;
        message.conversationId = conversationId;
        message.content = content;
        message.createdAt = createdAt;
        message.updatedAt = updatedAt;

        expect(message.id).toBe(id);
        expect(message.conversationId).toBe(conversationId);
        expect(message.content).toBe(content);
        expect(message.createdAt).toBe(createdAt);
        expect(message.updatedAt).toBe(updatedAt);
    });

    it('should allow updating message properties', () => {
        const message = new Message();
        message.id = 'msg-1';
        message.conversationId = 'conv-1';
        message.content = 'Original content';
        message.createdAt = new Date('2025-01-01');
        message.updatedAt = new Date('2025-01-01');

        message.content = 'Updated content';
        message.updatedAt = new Date('2025-01-02');

        expect(message.content).toBe('Updated content');
    });

    it('should have createdAt less than or equal to updatedAt', () => {
        const createdAt = new Date('2025-01-01');
        const updatedAt = new Date('2025-01-02');

        const message = new Message();
        message.id = 'msg-1';
        message.conversationId = 'conv-1';
        message.content = 'Test';
        message.createdAt = createdAt;
        message.updatedAt = updatedAt;

        expect(message.createdAt.getTime()).toBeLessThanOrEqual(
            message.updatedAt.getTime(),
        );
    });

    it('should associate message with a conversation', () => {
        const conversationId = 'conv-123';

        const message = new Message();
        message.id = 'msg-1';
        message.conversationId = conversationId;
        message.content = 'Test';
        message.createdAt = new Date();
        message.updatedAt = new Date();

        expect(message.conversationId).toBe(conversationId);
    });
});
