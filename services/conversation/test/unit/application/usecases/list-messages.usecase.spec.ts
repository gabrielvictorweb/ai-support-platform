import { Test, TestingModule } from '@nestjs/testing';
import { ListMessagesUseCase } from '../../../../src/application/usecases/list-messages.usecase';
import { Message } from '../../../../src/domain/entities/message.entity';
import { toMessageConnectionOutput } from '../../../../src/application/dtos';
import {
    type IFindMessages,
    type MessageCursorPaginationResult,
} from '../../../../src/application/ports/output';

describe('ListMessagesUseCase', () => {
    let useCase: ListMessagesUseCase;
    let findMessages: jest.Mocked<IFindMessages>;

    beforeEach(async () => {
        findMessages = {
            findAll: jest.fn(),
        };

        const module: TestingModule = await Test.createTestingModule({
            providers: [
                ListMessagesUseCase,
                {
                    provide: 'FindMessages',
                    useValue: findMessages,
                },
            ],
        }).compile();

        useCase = module.get(ListMessagesUseCase);
    });

    it('should return all messages', async () => {
        const mockMessages: Message[] = [
            {
                id: 'msg-1',
                conversationId: 'conv-1',
                content: 'Message 1',
                createdAt: new Date(),
                updatedAt: new Date(),
            },
            {
                id: 'msg-2',
                conversationId: 'conv-1',
                content: 'Message 2',
                createdAt: new Date(),
                updatedAt: new Date(),
            },
        ];

        const mockResult: MessageCursorPaginationResult = {
            items: mockMessages,
            nextCursor: null,
            hasNextPage: false,
        };

        findMessages.findAll.mockResolvedValue(mockResult);

        const result = await useCase.execute();

        expect(result).toEqual(toMessageConnectionOutput(mockResult));
        expect(result.items.length).toBe(2);
        expect(findMessages.findAll).toHaveBeenCalledWith({
            cursor: undefined,
            limit: 20,
        });
    });

    it('should return empty array when no messages exist', async () => {
        const mockResult: MessageCursorPaginationResult = {
            items: [],
            nextCursor: null,
            hasNextPage: false,
        };

        findMessages.findAll.mockResolvedValue(mockResult);

        const result = await useCase.execute();

        expect(result).toEqual(toMessageConnectionOutput(mockResult));
        expect(result.items.length).toBe(0);
    });
});
