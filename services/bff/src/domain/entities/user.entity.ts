export class UserEntity {
  constructor(
    public readonly id: string,
    public readonly name: string,
    public readonly role: string = 'USER',
  ) {}
}
