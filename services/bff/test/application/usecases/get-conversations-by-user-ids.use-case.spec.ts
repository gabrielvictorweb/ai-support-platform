import { type ConversationReadPort } from '../../../src/application/ports/output';
import { GetConversationsByUserIdsUseCase } from '../../../src/application/usecases/get-conversations-by-user-ids.usecase';
import { ConversationOutput } from '../../../src/application/dtos';

describe('GetConversationsByUserIdsUseCase', () => {
  const conversationReadPortMock = {
    findByUserIds: jest.fn(),
  } as unknown as ConversationReadPort;

  const useCase = new GetConversationsByUserIdsUseCase(conversationReadPortMock);

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('returns conversations grouped by user', async () => {
    const now = new Date('2024-01-01T00:00:00.000Z');
    const map = new Map<string, ConversationOutput[]>([
      [
        'u1',
        [
          {
            id: 'c1',
            participantIds: ['u1'],
            createdAt: now,
            updatedAt: now,
          },
        ],
      ],
    ]);

    jest
      .spyOn(conversationReadPortMock, 'findByUserIds')
      .mockResolvedValueOnce(map);

    const result = await useCase.execute({ userIds: ['u1'] });

    expect(result).toBe(map);
    expect(conversationReadPortMock.findByUserIds).toHaveBeenCalledWith(['u1']);
  });
});
