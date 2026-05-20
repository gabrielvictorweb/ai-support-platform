import { UserOutput } from '../../dtos';

export interface CreateUserData {
  externalId: string;
  name: string;
  email: string;
}

export interface UserReadPort {
  findAll(): Promise<UserOutput[]>;
  findById(userId: string): Promise<UserOutput | null>;
  findByIds(userIds: string[]): Promise<UserOutput[]>;
  findByExternalId(externalId: string): Promise<UserOutput | null>;
  create(data: CreateUserData): Promise<UserOutput>;
}
