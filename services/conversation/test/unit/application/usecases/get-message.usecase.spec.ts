import { Test, TestingModule } from '@nestjs/testing';
import { GetMessageUseCase } from '../../../../src/application/usecases/get-message.usecase';
import { Message } from '../../../../src/domain/entities/message.entity';
import { NotFoundException } from '@nestjs/common';
import {
    type GetMessageDto,
    toMessageOutput,
} from '../../../../src/application/dtos';
import { type IFindMessageById } from '../../../../src/application/ports/output';

describe('GetMessageUseCase', () => {
    let useCase: GetMessageUseCase;
    let findMessageById: jest.Mocked<IFindMessageById>;

    beforeEach(async () => {
        findMessageById = {
            findById: jest.fn(),
        };

        const module: TestingModule = await Test.createTestingModule({
            providers: [
                GetMessageUseCase,
                {
                    provide: 'FindMessageById',
                    useValue: findMessageById,
                },
            ],
        }).compile();

        useCase = module.get(GetMessageUseCase);
    });

    it('should return a message by id', async () => {
        const mockMessage: Message = {
            id: 'msg-1',
            conversationId: 'conv-1',
            content: 'Test',
            createdAt: new Date(),
            updatedAt: new Date(),
        };

        const input: GetMessageDto = { id: 'msg-1' };

        findMessageById.findById.mockResolvedValue(mockMessage);

        const result = await useCase.execute(input);

        expect(result).toEqual(toMessageOutput(mockMessage));
        expect(findMessageById.findById).toHaveBeenCalledWith('msg-1');
    });

    it('should throw NotFoundException when message does not exist', async () => {
        findMessageById.findById.mockResolvedValue(null);

        await expect(useCase.execute({ id: 'non-existent' })).rejects.toThrow(
            NotFoundException,
        );
    });
});
