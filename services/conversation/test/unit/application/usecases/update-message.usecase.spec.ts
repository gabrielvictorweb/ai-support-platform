import { Test, TestingModule } from '@nestjs/testing';
import { UpdateMessageUseCase } from '../../../../src/application/usecases/update-message.usecase';
import { Message } from '../../../../src/domain/entities/message.entity';
import { NotFoundException } from '@nestjs/common';
import {
    type UpdateMessageDto,
    toMessageOutput,
} from '../../../../src/application/dtos';
import {
    type IFindMessageById,
    type IUpdateMessage,
} from '../../../../src/application/ports/output';

describe('UpdateMessageUseCase', () => {
    let useCase: UpdateMessageUseCase;
    let findMessageById: jest.Mocked<IFindMessageById>;
    let updateMessage: jest.Mocked<IUpdateMessage>;

    beforeEach(async () => {
        findMessageById = {
            findById: jest.fn(),
        };

        updateMessage = {
            update: jest.fn(),
        };

        const module: TestingModule = await Test.createTestingModule({
            providers: [
                UpdateMessageUseCase,
                {
                    provide: 'FindMessageById',
                    useValue: findMessageById,
                },
                {
                    provide: 'UpdateMessage',
                    useValue: updateMessage,
                },
            ],
        }).compile();

        useCase = module.get(UpdateMessageUseCase);
    });

    it('should update message content', async () => {
        const existingMessage: Message = {
            id: 'msg-1',
            conversationId: 'conv-1',
            content: 'Old content',
            createdAt: new Date(),
            updatedAt: new Date(),
        };

        const updatedMessage: Message = {
            ...existingMessage,
            content: 'New content',
            updatedAt: new Date(),
        };

        const input: UpdateMessageDto = {
            id: 'msg-1',
            content: 'New content',
        };

        findMessageById.findById.mockResolvedValue(existingMessage);
        updateMessage.update.mockResolvedValue(updatedMessage);

        const result = await useCase.execute(input);

        expect(result).toEqual(toMessageOutput(updatedMessage));
        expect(updateMessage.update).toHaveBeenCalledWith(
            input.id,
            expect.objectContaining({
                content: input.content,
            }),
        );
    });

    it('should throw NotFoundException when message does not exist', async () => {
        findMessageById.findById.mockResolvedValue(null);

        await expect(
            useCase.execute({ id: 'non-existent', content: 'New content' }),
        ).rejects.toThrow(NotFoundException);
    });

    it('should update only content when provided', async () => {
        const existingMessage: Message = {
            id: 'msg-1',
            conversationId: 'conv-1',
            content: 'Old content',
            createdAt: new Date(),
            updatedAt: new Date(),
        };

        const updatedMessage: Message = {
            ...existingMessage,
            content: 'New content',
        };

        const input: UpdateMessageDto = {
            id: 'msg-1',
            content: 'New content',
        };

        findMessageById.findById.mockResolvedValue(existingMessage);
        updateMessage.update.mockResolvedValue(updatedMessage);

        const result = await useCase.execute(input);

        expect(result?.content).toBe(input.content);
    });

    it('should update message when content is not provided', async () => {
        const existingMessage: Message = {
            id: 'msg-1',
            conversationId: 'conv-1',
            content: 'Old content',
            createdAt: new Date(),
            updatedAt: new Date(),
        };

        const updatedMessage: Message = {
            ...existingMessage,
            updatedAt: new Date(),
        };

        const input: UpdateMessageDto = {
            id: 'msg-1',
        };

        findMessageById.findById.mockResolvedValue(existingMessage);
        updateMessage.update.mockResolvedValue(updatedMessage);

        const result = await useCase.execute(input);

        expect(result).toEqual(toMessageOutput(updatedMessage));
        expect(updateMessage.update).toHaveBeenCalledWith(input.id, {});
    });
});
