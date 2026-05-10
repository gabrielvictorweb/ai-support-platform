import { Test, TestingModule } from '@nestjs/testing';
import { GetConversationUseCase } from '../../../../src/application/usecases/get-conversation.usecase';
import { Conversation } from '../../../../src/domain/entities/conversation.entity';
import {
    type GetConversationDto,
    toConversationOutput,
} from '../../../../src/application/dtos';
import { type IFindConversationById } from '../../../../src/application/ports/output';

describe('GetConversationUseCase', () => {
    let useCase: GetConversationUseCase;
    let findConversationById: jest.Mocked<IFindConversationById>;

    beforeEach(async () => {
        findConversationById = {
            findById: jest.fn(),
        };

        const module: TestingModule = await Test.createTestingModule({
            providers: [
                GetConversationUseCase,
                {
                    provide: 'FindConversationById',
                    useValue: findConversationById,
                },
            ],
        }).compile();

        useCase = module.get(GetConversationUseCase);
    });

    it('should return a conversation by id', async () => {
        const mockConversation: Conversation = {
            id: 'conv-1',
            participantIds: ['user-1'],
            createdAt: new Date(),
            updatedAt: new Date(),
        };

        const input: GetConversationDto = { id: 'conv-1' };

        findConversationById.findById.mockResolvedValue(mockConversation);

        const result = await useCase.execute(input);

        expect(result).toEqual(toConversationOutput(mockConversation));
        expect(findConversationById.findById).toHaveBeenCalledWith('conv-1');
    });

    it('should return null when conversation does not exist', async () => {
        findConversationById.findById.mockResolvedValue(null);

        const result = await useCase.execute({ id: 'non-existent' });

        expect(result).toBeNull();
    });
});
