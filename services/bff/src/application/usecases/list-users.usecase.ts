import { type ListUsersInput } from '../ports/input';
import { type ListUsersDto, type UserOutput } from '../dtos';
import { type UserReadPort } from '../ports/output';

export class ListUsersUseCase implements ListUsersInput {
  constructor(private readonly userReadPort: UserReadPort) {}

  async execute(input: ListUsersDto): Promise<UserOutput[]> {
    if (!input.userIds || input.userIds.length === 0) {
      return this.userReadPort.findAll();
    }
    return this.userReadPort.findByIds(input.userIds);
  }
}
