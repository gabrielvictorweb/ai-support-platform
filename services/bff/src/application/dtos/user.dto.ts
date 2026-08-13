import { UserEntity } from '../../domain/entities/user.entity';

export type UserRole = 'USER' | 'SUPPORT';

export interface UserOutput {
  id: string;
  name: string;
  role: UserRole;
}

export const toUserOutput = (user: UserEntity): UserOutput => ({
  id: user.id,
  name: user.name,
  role: user.role === 'SUPPORT' ? 'SUPPORT' : 'USER',
});

export interface GetOrProvisionUserDto {
  externalId: string;
  name?: string;
  email?: string;
}

export interface ListUsersDto {
  userIds?: string[];
}
