import { ListUsersDto, UserOutput } from '../../dtos';

export interface ListUsersInput {
  execute(input: ListUsersDto): Promise<UserOutput[]>;
}
