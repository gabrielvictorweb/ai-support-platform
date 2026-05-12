import { UserNotFoundError } from '../../domain/errors/user-not-found.error';
import { type GetCurrentUserInput } from '../ports/input';
import { type GetCurrentUserDto, type UserOutput } from '../dtos';
import { type UserReadPort } from '../ports/output';

export class GetCurrentUserUseCase implements GetCurrentUserInput {
  constructor(private readonly userReadPort: UserReadPort) {}

  async execute(input: GetCurrentUserDto): Promise<UserOutput> {
    const user = await this.userReadPort.findById(input.userId);

    if (!user) {
      throw new UserNotFoundError(input.userId);
    }

    return user;
  }
}
