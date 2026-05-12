import { UserNotFoundError } from '../../../src/domain/errors/user-not-found.error';
import { type UserReadPort } from '../../../src/application/ports/output';
import { GetCurrentUserUseCase } from '../../../src/application/usecases/get-current-user.usecase';
import { UserOutput } from '../../../src/application/dtos';

describe('GetCurrentUserUseCase', () => {
  const userReadPortMock = {
    findById: jest.fn(),
    findByIds: jest.fn(),
  } as unknown as UserReadPort;

  const useCase = new GetCurrentUserUseCase(userReadPortMock);

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('returns current user when found', async () => {
    const user: UserOutput = { id: 'u1', name: 'Ana Silva' };
    jest.spyOn(userReadPortMock, 'findById').mockResolvedValueOnce(user);

    const result = await useCase.execute({ userId: 'u1' });

    expect(result).toBe(user);
    expect(userReadPortMock.findById).toHaveBeenCalledWith('u1');
  });

  it('throws when user is not found', async () => {
    jest.spyOn(userReadPortMock, 'findById').mockResolvedValueOnce(null);

    await expect(useCase.execute({ userId: 'missing' })).rejects.toBeInstanceOf(
      UserNotFoundError,
    );
  });
});
