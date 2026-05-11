import { Test, TestingModule } from '@nestjs/testing';
import { DeleteConversationUseCase } from '../../../../src/application/usecases/delete-conversation.usecase';
import { Conversation } from '../../../../src/domain/entities/conversation.entity';
import { NotFoundException } from '@nestjs/common';
import { type DeleteConversationDto } from '../../../../src/application/dtos';
import {
    type IDeleteConversation,
    type IFindConversationById,
} from '../../../../src/application/ports/output';

describe('DeleteConversationUseCase', () => {
    let useCase: DeleteConversationUseCase;
    let findConversationById: jest.Mocked<IFindConversationById>;
    let deleteConversation: jest.Mocked<IDeleteConversation>;

    beforeEach(async () => {
        findConversationById = {
            findById: jest.fn(),
        };

        deleteConversation = {
            delete: jest.fn(),
        };

        const module: TestingModule = await Test.createTestingModule({
            providers: [
                DeleteConversationUseCase,
                {
                    provide: 'FindConversationById',
                    useValue: findConversationById,
                },
                {
                    provide: 'DeleteConversation',
                    useValue: deleteConversation,
                },
            ],
        }).compile();

        useCase = module.get(DeleteConversationUseCase);
    });

    it('should delete a conversation', async () => {
        const mockConversation: Conversation = {
            id: 'conv-1',
            participantIds: ['user-1'],
            createdAt: new Date(),
            updatedAt: new Date(),
        };

        const input: DeleteConversationDto = { id: 'conv-1' };

        findConversationById.findById.mockResolvedValue(mockConversation);
        deleteConversation.delete.mockResolvedValue(true);

        const result = await useCase.execute(input);

        expect(result).toEqual({ success: true });
        expect(deleteConversation.delete).toHaveBeenCalledWith(input.id);
    });

    it('should throw NotFoundException when conversation does not exist', async () => {
        findConversationById.findById.mockResolvedValue(null);

        await expect(useCase.execute({ id: 'non-existent' })).rejects.toThrow(
            NotFoundException,
        );
    });
});
