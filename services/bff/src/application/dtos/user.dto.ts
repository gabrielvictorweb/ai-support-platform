import { UserEntity } from '../../domain/entities/user.entity';

export interface UserOutput {
  id: string;
  name: string;
}

export const toUserOutput = (user: UserEntity): UserOutput => ({
  id: user.id,
  name: user.name,
});

export interface GetOrProvisionUserDto {
  externalId: string;
  name?: string;
  email?: string;
}

export interface ListUsersDto {
  userIds?: string[];
}
