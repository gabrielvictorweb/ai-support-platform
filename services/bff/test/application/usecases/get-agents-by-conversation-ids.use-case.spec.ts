import { type AgentReadPort } from '../../../src/application/ports/output';
import { GetAgentsByConversationIdsUseCase } from '../../../src/application/usecases/get-agents-by-conversation-ids.usecase';
import { AgentOutput } from '../../../src/application/dtos';

describe('GetAgentsByConversationIdsUseCase', () => {
  const agentReadPortMock = {
    findByConversationIds: jest.fn(),
  } as unknown as AgentReadPort;

  const useCase = new GetAgentsByConversationIdsUseCase(agentReadPortMock);

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('returns agents grouped by conversation', async () => {
    const map = new Map<string, AgentOutput[]>([
      ['c1', [{ id: 'a1', conversationId: 'c1', name: 'SupportBot' }]],
    ]);

    jest
      .spyOn(agentReadPortMock, 'findByConversationIds')
      .mockResolvedValueOnce(map);

    const result = await useCase.execute({ conversationIds: ['c1'] });

    expect(result).toBe(map);
    expect(agentReadPortMock.findByConversationIds).toHaveBeenCalledWith(['c1']);
  });
});
