import { UserOutput } from '../../application/dtos';
import { UserDto } from '../graphql/dto/user.dto';

export class UserPresenter {
  static toGraphql(user: UserOutput): UserDto {
    return {
      id: user.id,
      name: user.name,
      conversations: [],
    };
  }
}
