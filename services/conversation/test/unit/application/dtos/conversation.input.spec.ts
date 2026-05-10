import { validate } from 'class-validator';
import { GetConversationDto } from '../../../../src/application/dtos/conversation.dto';

describe('Conversation Input', () => {
    it('should validate a valid uuid', async () => {
        const input = new GetConversationDto();
        input.id = '550e8400-e29b-41d4-a716-446655440000';

        const errors = await validate(input);

        expect(errors).toHaveLength(0);
    });

    it('should invalidate a non-uuid id', async () => {
        const input = new GetConversationDto();
        input.id = 'not-a-uuid';

        const errors = await validate(input);

        expect(errors.length).toBeGreaterThan(0);
    });
});
