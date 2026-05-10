import { Conversation } from '../../../../src/domain/entities/conversation.entity';

describe('Conversation Entity', () => {
    it('should create a conversation instance with valid properties', () => {
        const id = 'conv-1';
        const participantIds = ['user-1', 'user-2'];
        const createdAt = new Date();
        const updatedAt = new Date();

        const conversation = new Conversation();
        conversation.id = id;
        conversation.participantIds = participantIds;
        conversation.createdAt = createdAt;
        conversation.updatedAt = updatedAt;

        expect(conversation.id).toBe(id);
        expect(conversation.participantIds).toEqual(participantIds);
        expect(conversation.createdAt).toBe(createdAt);
        expect(conversation.updatedAt).toBe(updatedAt);
    });

    it('should allow updating conversation properties', () => {
        const conversation = new Conversation();
        conversation.id = 'conv-1';
        conversation.participantIds = ['user-1'];
        conversation.createdAt = new Date('2025-01-01');
        conversation.updatedAt = new Date('2025-01-01');

        conversation.participantIds = ['user-1', 'user-2'];
        conversation.updatedAt = new Date('2025-01-02');

        expect(conversation.participantIds).toEqual(['user-1', 'user-2']);
    });

    it('should have createdAt less than or equal to updatedAt', () => {
        const createdAt = new Date('2025-01-01');
        const updatedAt = new Date('2025-01-02');

        const conversation = new Conversation();
        conversation.id = 'conv-1';
        conversation.participantIds = [];
        conversation.createdAt = createdAt;
        conversation.updatedAt = updatedAt;

        expect(conversation.createdAt.getTime()).toBeLessThanOrEqual(
            conversation.updatedAt.getTime(),
        );
    });
});
