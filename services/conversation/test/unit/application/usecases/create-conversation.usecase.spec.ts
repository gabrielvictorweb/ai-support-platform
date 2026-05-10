import { Test, TestingModule } from '@nestjs/testing';
import { CreateConversationUseCase } from '../../../../src/application/usecases/create-conversation.usecase';
import { Conversation } from '../../../../src/domain/entities/conversation.entity';
import {
    type CreateConversationDto,
    toConversationOutput,
} from '../../../../src/application/dtos';
import { type ICreateConversation } from '../../../../src/application/ports/output';

describe('CreateConversationUseCase', () => {
    let useCase: CreateConversationUseCase;
    let createConversation: jest.Mocked<ICreateConversation>;

    beforeEach(async () => {
        createConversation = {
            create: jest.fn(),
        };

        const module: TestingModule = await Test.createTestingModule({
            providers: [
                CreateConversationUseCase,
                {
                    provide: 'CreateConversation',
                    useValue: createConversation,
                },
            ],
        }).compile();

        useCase = module.get(CreateConversationUseCase);
    });

    it('should create a conversation with participantIds', async () => {
        const input: CreateConversationDto = {
            participantIds: ['user-1', 'user-2'],
        };

        const mockConversation: Conversation = {
            id: 'conv-1',
            participantIds: input.participantIds,
            createdAt: new Date(),
            updatedAt: new Date(),
        };

        createConversation.create.mockResolvedValue(mockConversation);

        const result = await useCase.execute(input);

        expect(result).toEqual(toConversationOutput(mockConversation));
        expect(createConversation.create).toHaveBeenCalledWith(
            expect.objectContaining({
                participantIds: input.participantIds,
                createdAt: expect.any(Date),
                updatedAt: expect.any(Date),
            }),
        );
    });

    it('should create a conversation with no participantIds', async () => {
        const input: CreateConversationDto = {};

        const mockConversation: Conversation = {
            id: 'conv-2',
            participantIds: [],
            createdAt: new Date(),
            updatedAt: new Date(),
        };

        createConversation.create.mockResolvedValue(mockConversation);

        const result = await useCase.execute(input);

        expect(result).toEqual(toConversationOutput(mockConversation));
        expect(createConversation.create).toHaveBeenCalledWith(
            expect.objectContaining({
                participantIds: [],
                createdAt: expect.any(Date),
                updatedAt: expect.any(Date),
            }),
        );
    });
});
