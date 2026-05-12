import * as dtos from '../../../../src/presentation/dtos';

describe('Interface DTO index', () => {
    it('should export conversation and message dtos', () => {
        expect(dtos.CreateConversationDto).toBeDefined();
        expect(dtos.UpdateConversationDto).toBeDefined();
        expect(dtos.CreateMessageDto).toBeDefined();
        expect(dtos.UpdateMessageDto).toBeDefined();
    });
});
