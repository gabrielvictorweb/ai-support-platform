import { Test, TestingModule } from '@nestjs/testing';
import { DeleteMessageUseCase } from '../../../../src/application/usecases/delete-message.usecase';
import { Message } from '../../../../src/domain/entities/message.entity';
import { NotFoundException } from '@nestjs/common';
import { type DeleteMessageDto } from '../../../../src/application/dtos';
import {
    type IDeleteMessage,
    type IFindMessageById,
} from '../../../../src/application/ports/output';

describe('DeleteMessageUseCase', () => {
    let useCase: DeleteMessageUseCase;
    let findMessageById: jest.Mocked<IFindMessageById>;
    let deleteMessage: jest.Mocked<IDeleteMessage>;

    beforeEach(async () => {
        findMessageById = {
            findById: jest.fn(),
        };

        deleteMessage = {
            delete: jest.fn(),
        };

        const module: TestingModule = await Test.createTestingModule({
            providers: [
                DeleteMessageUseCase,
                {
                    provide: 'FindMessageById',
                    useValue: findMessageById,
                },
                {
                    provide: 'DeleteMessage',
                    useValue: deleteMessage,
                },
            ],
        }).compile();

        useCase = module.get(DeleteMessageUseCase);
    });

    it('should delete a message', async () => {
        const mockMessage: Message = {
            id: 'msg-1',
            conversationId: 'conv-1',
            content: 'Test',
            createdAt: new Date(),
            updatedAt: new Date(),
        };

        const input: DeleteMessageDto = { id: 'msg-1' };

        findMessageById.findById.mockResolvedValue(mockMessage);
        deleteMessage.delete.mockResolvedValue(true);

        const result = await useCase.execute(input);

        expect(result).toEqual({ success: true });
        expect(deleteMessage.delete).toHaveBeenCalledWith(input.id);
    });

    it('should throw NotFoundException when message does not exist', async () => {
        findMessageById.findById.mockResolvedValue(null);

        await expect(useCase.execute({ id: 'non-existent' })).rejects.toThrow(
            NotFoundException,
        );
    });
});
