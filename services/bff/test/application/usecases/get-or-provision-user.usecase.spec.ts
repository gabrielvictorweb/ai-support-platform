import { type UserReadPort } from '../../../src/application/ports/output';
import { GetOrProvisionUserUseCase } from '../../../src/application/usecases/get-or-provision-user.usecase';
import { UserOutput } from '../../../src/application/dtos';

describe('GetOrProvisionUserUseCase', () => {
  const userReadPortMock = {
    findByExternalId: jest.fn(),
    create: jest.fn(),
  } as unknown as UserReadPort;

  const useCase = new GetOrProvisionUserUseCase(userReadPortMock, [
    'support@example.dev',
  ]);

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('returns the existing user (USER role) without provisioning', async () => {
    const user: UserOutput = { id: 'u1', name: 'Ana Silva', role: 'USER' };
    jest
      .spyOn(userReadPortMock, 'findByExternalId')
      .mockResolvedValueOnce(user);

    const result = await useCase.execute({
      externalId: 'auth0|1',
      name: 'Ana',
      email: 'ana@example.dev',
    });

    expect(result).toEqual({ id: 'u1', name: 'Ana Silva', role: 'USER' });
    expect(userReadPortMock.findByExternalId).toHaveBeenCalledWith('auth0|1');
    expect(userReadPortMock.create).not.toHaveBeenCalled();
  });

  it('reapplies SUPPORT role from the allowlist to an existing user', async () => {
    const user: UserOutput = { id: 'u9', name: 'Support', role: 'USER' };
    jest
      .spyOn(userReadPortMock, 'findByExternalId')
      .mockResolvedValueOnce(user);

    const result = await useCase.execute({
      externalId: 'auth0|9',
      email: 'Support@Example.dev',
    });

    expect(result.role).toBe('SUPPORT');
  });

  it('provisions a new USER when none exists', async () => {
    const created: UserOutput = { id: 'u2', name: 'Bruno Costa', role: 'USER' };
    jest
      .spyOn(userReadPortMock, 'findByExternalId')
      .mockResolvedValueOnce(null);
    jest.spyOn(userReadPortMock, 'create').mockResolvedValueOnce(created);

    const result = await useCase.execute({
      externalId: 'auth0|2',
      name: 'Bruno Costa',
      email: 'bruno@example.dev',
    });

    expect(result).toBe(created);
    expect(userReadPortMock.create).toHaveBeenCalledWith({
      externalId: 'auth0|2',
      name: 'Bruno Costa',
      email: 'bruno@example.dev',
      role: 'USER',
    });
  });

  it('provisions a SUPPORT user when the email is in the allowlist', async () => {
    jest.spyOn(userReadPortMock, 'findByExternalId').mockResolvedValueOnce(null);
    jest
      .spyOn(userReadPortMock, 'create')
      .mockImplementation(async (data) => ({
        id: 'u5',
        name: data.name,
        role: data.role,
      }));

    const result = await useCase.execute({
      externalId: 'auth0|5',
      email: 'support@example.dev',
    });

    expect(result.role).toBe('SUPPORT');
    expect(userReadPortMock.create).toHaveBeenCalledWith(
      expect.objectContaining({ role: 'SUPPORT' }),
    );
  });

  it('falls back to email then "User" for the provisioned name', async () => {
    jest.spyOn(userReadPortMock, 'findByExternalId').mockResolvedValue(null);
    jest
      .spyOn(userReadPortMock, 'create')
      .mockImplementation(async (data) => ({
        id: 'u3',
        name: data.name,
        role: data.role,
      }));

    const byEmail = await useCase.execute({
      externalId: 'auth0|3',
      email: 'only@email.dev',
    });
    expect(byEmail.name).toBe('only@email.dev');

    const fallback = await useCase.execute({ externalId: 'auth0|4' });
    expect(fallback.name).toBe('User');
  });
});
