import { Test, TestingModule } from '@nestjs/testing';
import { ListConversationsUseCase } from '../../../../src/application/usecases/list-conversations.usecase';
import { Conversation } from '../../../../src/domain/entities/conversation.entity';
import { toConversationOutput } from '../../../../src/application/dtos';
import { type IFindConversations } from '../../../../src/application/ports/output';

describe('ListConversationsUseCase', () => {
    let useCase: ListConversationsUseCase;
    let findConversations: jest.Mocked<IFindConversations>;

    beforeEach(async () => {
        findConversations = {
            findAll: jest.fn(),
        };

        const module: TestingModule = await Test.createTestingModule({
            providers: [
                ListConversationsUseCase,
                {
                    provide: 'FindConversations',
                    useValue: findConversations,
                },
            ],
        }).compile();

        useCase = module.get(ListConversationsUseCase);
    });

    it('should return all conversations', async () => {
        const mockConversations: Conversation[] = [
            {
                id: 'conv-1',
                participantIds: ['user-1'],
                createdAt: new Date(),
                updatedAt: new Date(),
            },
            {
                id: 'conv-2',
                participantIds: ['user-2', 'user-3'],
                createdAt: new Date(),
                updatedAt: new Date(),
            },
        ];

        findConversations.findAll.mockResolvedValue(mockConversations);

        const result = await useCase.execute();

        expect(result).toEqual(
            mockConversations.map((conversation) =>
                toConversationOutput(conversation),
            ),
        );
        expect(result.length).toBe(2);
        expect(findConversations.findAll).toHaveBeenCalled();
    });

    it('should return empty array when no conversations exist', async () => {
        findConversations.findAll.mockResolvedValue([]);

        const result = await useCase.execute();

        expect(result).toEqual([]);
        expect(result.length).toBe(0);
    });
});
