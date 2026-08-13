import { Field, ID, ObjectType } from '@nestjs/graphql';

@ObjectType('Message')
export class MessageDto {
  @Field(() => ID)
  id!: string;

  @Field(() => ID)
  conversationId!: string;

  @Field(() => ID, { nullable: true })
  senderId!: string | null;

  @Field()
  content!: string;

  @Field()
  createdAt!: string;

  @Field()
  updatedAt!: string;
}
