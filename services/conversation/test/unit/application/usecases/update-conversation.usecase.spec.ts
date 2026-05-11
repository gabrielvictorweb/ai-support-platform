import { Test, TestingModule } from '@nestjs/testing';
import { UpdateConversationUseCase } from '../../../../src/application/usecases/update-conversation.usecase';
import { Conversation } from '../../../../src/domain/entities/conversation.entity';
import { NotFoundException } from '@nestjs/common';
import {
    type UpdateConversationDto,
    toConversationOutput,
} from '../../../../src/application/dtos';
import {
    type IFindConversationById,
    type IUpdateConversation,
} from '../../../../src/application/ports/output';

describe('UpdateConversationUseCase', () => {
    let useCase: UpdateConversationUseCase;
    let findConversationById: jest.Mocked<IFindConversationById>;
    let updateConversation: jest.Mocked<IUpdateConversation>;

    beforeEach(async () => {
        findConversationById = {
            findById: jest.fn(),
        };

        updateConversation = {
            update: jest.fn(),
        };

        const module: TestingModule = await Test.createTestingModule({
            providers: [
                UpdateConversationUseCase,
                {
                    provide: 'FindConversationById',
                    useValue: findConversationById,
                },
                {
                    provide: 'UpdateConversation',
                    useValue: updateConversation,
                },
            ],
        }).compile();

        useCase = module.get(UpdateConversationUseCase);
    });

    it('should update conversation with new participantIds', async () => {
        const existingConversation: Conversation = {
            id: 'conv-1',
            participantIds: ['user-1'],
            createdAt: new Date(),
            updatedAt: new Date(),
        };

        const updatedConversation: Conversation = {
            ...existingConversation,
            participantIds: ['user-1', 'user-2'],
            updatedAt: new Date(),
        };

        const input: UpdateConversationDto = {
            id: 'conv-1',
            participantIds: ['user-1', 'user-2'],
        };

        findConversationById.findById.mockResolvedValue(existingConversation);
        updateConversation.update.mockResolvedValue(updatedConversation);

        const result = await useCase.execute(input);

        expect(result).toEqual(toConversationOutput(updatedConversation));
        expect(updateConversation.update).toHaveBeenCalledWith(
            input.id,
            expect.objectContaining({
                participantIds: input.participantIds,
            }),
        );
    });

    it('should throw NotFoundException when conversation does not exist', async () => {
        findConversationById.findById.mockResolvedValue(null);

        await expect(
            useCase.execute({ id: 'non-existent', participantIds: ['user-1'] }),
        ).rejects.toThrow(NotFoundException);
    });

    it('should update participantIds when provided', async () => {
        const existingConversation: Conversation = {
            id: 'conv-1',
            participantIds: ['user-1'],
            createdAt: new Date(),
            updatedAt: new Date(),
        };

        const updatedConversation: Conversation = {
            ...existingConversation,
            participantIds: ['user-1', 'user-3'],
        };

        const input: UpdateConversationDto = {
            id: 'conv-1',
            participantIds: ['user-1', 'user-3'],
        };

        findConversationById.findById.mockResolvedValue(existingConversation);
        updateConversation.update.mockResolvedValue(updatedConversation);

        const result = await useCase.execute(input);

        expect(result?.participantIds).toEqual(input.participantIds);
    });

    it('should update conversation when participantIds is not provided', async () => {
        const existingConversation: Conversation = {
            id: 'conv-1',
            participantIds: ['user-1'],
            createdAt: new Date(),
            updatedAt: new Date(),
        };

        const updatedConversation: Conversation = {
            ...existingConversation,
            updatedAt: new Date(),
        };

        const input: UpdateConversationDto = {
            id: 'conv-1',
        };

        findConversationById.findById.mockResolvedValue(existingConversation);
        updateConversation.update.mockResolvedValue(updatedConversation);

        const result = await useCase.execute(input);

        expect(result).toEqual(toConversationOutput(updatedConversation));
        expect(updateConversation.update).toHaveBeenCalledWith(input.id, {});
    });
});
