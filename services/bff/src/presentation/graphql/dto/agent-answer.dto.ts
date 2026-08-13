import { Field, Float, ObjectType } from '@nestjs/graphql';

@ObjectType('AgentSource')
export class AgentSourceDto {
  @Field()
  content!: string;

  @Field()
  source!: string;

  @Field(() => Float)
  score!: number;
}

@ObjectType('AgentAnswer')
export class AgentAnswerDto {
  @Field()
  answer!: string;

  @Field(() => [AgentSourceDto])
  sources!: AgentSourceDto[];
}
