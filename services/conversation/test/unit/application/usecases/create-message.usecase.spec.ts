import { Test, TestingModule } from '@nestjs/testing';
import { CreateMessageUseCase } from '../../../../src/application/usecases/create-message.usecase';
import { Message } from '../../../../src/domain/entities/message.entity';
import {
    type CreateMessageDto,
    toMessageOutput,
} from '../../../../src/application/dtos';
import { type ICreateMessage } from '../../../../src/application/ports/output';

describe('CreateMessageUseCase', () => {
    let useCase: CreateMessageUseCase;
    let createMessage: jest.Mocked<ICreateMessage>;

    beforeEach(async () => {
        createMessage = {
            create: jest.fn(),
        };

        const module: TestingModule = await Test.createTestingModule({
            providers: [
                CreateMessageUseCase,
                {
                    provide: 'CreateMessage',
                    useValue: createMessage,
                },
            ],
        }).compile();

        useCase = module.get(CreateMessageUseCase);
    });

    it('should create a message with conversationId and content', async () => {
        const input: CreateMessageDto = {
            conversationId: 'conv-1',
            content: 'Test message',
        };

        const mockMessage: Message = {
            id: 'msg-1',
            conversationId: input.conversationId,
            content: input.content,
            createdAt: new Date(),
            updatedAt: new Date(),
        };

        createMessage.create.mockResolvedValue(mockMessage);

        const result = await useCase.execute(input);

        expect(result).toEqual(toMessageOutput(mockMessage));
        expect(createMessage.create).toHaveBeenCalledWith(
            expect.objectContaining({
                conversationId: input.conversationId,
                content: input.content,
                createdAt: expect.any(Date),
                updatedAt: expect.any(Date),
            }),
        );
    });
});
