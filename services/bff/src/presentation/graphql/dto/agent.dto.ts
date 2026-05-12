import { Field, ID, ObjectType } from '@nestjs/graphql';

@ObjectType('Agent')
export class AgentDto {
  @Field(() => ID)
  id!: string;

  @Field()
  name!: string;
}
