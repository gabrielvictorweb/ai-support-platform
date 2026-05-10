import { Test, TestingModule } from '@nestjs/testing';
import { ListMessagesByConversationUseCase } from '../../../../src/application/usecases/list-messages-by-conversation.usecase';
import { Message } from '../../../../src/domain/entities/message.entity';
import {
    type ListMessagesByConversationDto,
    toMessageConnectionOutput,
} from '../../../../src/application/dtos';
import {
    type IFindMessagesByConversationId,
    type MessageCursorPaginationResult,
} from '../../../../src/application/ports/output';

describe('ListMessagesByConversationUseCase', () => {
    let useCase: ListMessagesByConversationUseCase;
    let findMessagesByConversationId: jest.Mocked<IFindMessagesByConversationId>;

    beforeEach(async () => {
        findMessagesByConversationId = {
            findByConversationId: jest.fn(),
        };

        const module: TestingModule = await Test.createTestingModule({
            providers: [
                ListMessagesByConversationUseCase,
                {
                    provide: 'FindMessagesByConversationId',
                    useValue: findMessagesByConversationId,
                },
            ],
        }).compile();

        useCase = module.get(ListMessagesByConversationUseCase);
    });

    it('should return all messages for a conversation', async () => {
        const input: ListMessagesByConversationDto = {
            conversationId: 'conv-1',
        };
        const mockMessages: Message[] = [
            {
                id: 'msg-1',
                conversationId: input.conversationId,
                content: 'Message 1',
                createdAt: new Date(),
                updatedAt: new Date(),
            },
            {
                id: 'msg-2',
                conversationId: input.conversationId,
                content: 'Message 2',
                createdAt: new Date(),
                updatedAt: new Date(),
            },
        ];

        const mockResponse: MessageCursorPaginationResult = {
            items: mockMessages,
            nextCursor: null,
            hasNextPage: false,
        };

        findMessagesByConversationId.findByConversationId.mockResolvedValue(
            mockResponse,
        );

        const result = await useCase.execute(input);

        expect(result).toEqual(toMessageConnectionOutput(mockResponse));
        expect(result.items).toHaveLength(2);
        expect(
            findMessagesByConversationId.findByConversationId,
        ).toHaveBeenCalledWith(input.conversationId, {
            cursor: undefined,
            limit: 20,
        });
    });

    it('should return empty items when conversation has no messages', async () => {
        findMessagesByConversationId.findByConversationId.mockResolvedValue({
            items: [],
            nextCursor: null,
            hasNextPage: false,
        });

        const result = await useCase.execute({ conversationId: 'conv-1' });

        expect(result.items).toEqual([]);
        expect(result.hasNextPage).toBe(false);
        expect(result.nextCursor).toBeNull();
    });
});
