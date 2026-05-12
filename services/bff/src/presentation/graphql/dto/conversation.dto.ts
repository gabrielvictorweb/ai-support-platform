import { Field, ID, ObjectType } from '@nestjs/graphql';

@ObjectType('Conversation')
export class ConversationDto {
  @Field(() => ID)
  id!: string;

  @Field(() => [ID])
  participantIds!: string[];

  @Field()
  createdAt!: string;

  @Field()
  updatedAt!: string;
}
