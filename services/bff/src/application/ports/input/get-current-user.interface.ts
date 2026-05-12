import { GetCurrentUserDto, UserOutput } from '../../dtos';

export interface GetCurrentUserInput {
  execute(input: GetCurrentUserDto): Promise<UserOutput>;
}
