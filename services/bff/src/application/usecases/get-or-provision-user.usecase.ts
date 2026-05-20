import { type GetOrProvisionUserDto, type UserOutput } from '../dtos';
import { type UserReadPort } from '../ports/output';

export class GetOrProvisionUserUseCase {
  constructor(private readonly userReadPort: UserReadPort) {}

  async execute(input: GetOrProvisionUserDto): Promise<UserOutput> {
    const existing = await this.userReadPort.findByExternalId(input.externalId);

    if (existing) {
      return existing;
    }

    return this.userReadPort.create({
      externalId: input.externalId,
      name: input.name ?? input.email ?? 'User',
      email: input.email ?? '',
    });
  }
}
