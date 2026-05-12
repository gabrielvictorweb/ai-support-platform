import { Field, ID, ObjectType } from '@nestjs/graphql';
import { ConversationDto } from './conversation.dto';

@ObjectType('User')
export class UserDto {
  @Field(() => ID)
  id!: string;

  @Field()
  name!: string;

  @Field(() => [ConversationDto])
  conversations!: ConversationDto[];
}
