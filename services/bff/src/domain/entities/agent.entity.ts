export class AgentEntity {
  constructor(
    public readonly id: string,
    public readonly conversationId: string,
    public readonly name: string,
  ) {}
}
