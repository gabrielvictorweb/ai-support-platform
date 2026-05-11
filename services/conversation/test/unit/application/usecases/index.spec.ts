import * as usecases from '../../../../src/application/usecases';

describe('UseCases Index', () => {
    it('should export conversation use cases', () => {
        expect(usecases.CreateConversationUseCase).toBeDefined();
        expect(usecases.GetConversationUseCase).toBeDefined();
        expect(usecases.ListConversationsUseCase).toBeDefined();
    });

    it('should export message use cases', () => {
        expect(usecases.CreateMessageUseCase).toBeDefined();
        expect(usecases.GetMessageUseCase).toBeDefined();
        expect(usecases.ListMessagesUseCase).toBeDefined();
    });
});
