import { UserOutput } from '../../dtos';

export interface UserReadPort {
  findAll(): Promise<UserOutput[]>;
  findById(userId: string): Promise<UserOutput | null>;
  findByIds(userIds: string[]): Promise<UserOutput[]>;
}
