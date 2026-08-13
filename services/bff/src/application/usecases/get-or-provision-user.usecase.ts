import {
  type GetOrProvisionUserDto,
  type UserOutput,
  type UserRole,
} from '../dtos';
import { type UserReadPort } from '../ports/output';

export class GetOrProvisionUserUseCase {
  // A allowlist é a fonte da verdade do papel: emails (lowercase) tratados como
  // SUPPORT; os demais são USER.
  constructor(
    private readonly userReadPort: UserReadPort,
    private readonly supportEmails: string[] = [],
  ) {}

  async execute(input: GetOrProvisionUserDto): Promise<UserOutput> {
    const role = this.roleFor(input.email);
    const existing = await this.userReadPort.findByExternalId(input.externalId);

    if (existing) {
      // Reaplica o papel da allowlist mesmo que o registro no DB esteja defasado.
      return { ...existing, role };
    }

    return this.userReadPort.create({
      externalId: input.externalId,
      name: input.name ?? input.email ?? 'User',
      email: input.email ?? '',
      role,
    });
  }

  private roleFor(email?: string): UserRole {
    const normalized = email?.trim().toLowerCase();
    return normalized && this.supportEmails.includes(normalized)
      ? 'SUPPORT'
      : 'USER';
  }
}
