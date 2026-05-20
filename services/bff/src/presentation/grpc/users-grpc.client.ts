import { Inject, Injectable, Logger, OnModuleInit } from '@nestjs/common';
import type { ClientGrpc } from '@nestjs/microservices';
import { firstValueFrom, Observable } from 'rxjs';
import {
  type CreateUserData,
  UserReadPort,
} from '../../application/ports/output/user-read.port';
import { type UserOutput, toUserOutput } from '../../application/dtos';
import { UserEntity } from '../../domain/entities/user.entity';

const USERS: UserOutput[] = [
  { id: 'u1', name: 'Ana Silva' },
  { id: 'u2', name: 'Bruno Costa' },
  { id: 'u3', name: 'Carla Souza' },
];

type EmptyRequest = object;

interface UserMessage {
  id: string;
  name: string;
  email?: string;
  phone?: string;
  externalId?: string;
}

interface FindAllUsersResponse {
  users: UserMessage[];
}

interface UserServiceClient {
  findAllUsers(request: EmptyRequest): Observable<FindAllUsersResponse>;
  findUserById(request: { id: string }): Observable<UserMessage>;
  findUserByExternalId(request: {
    externalId: string;
  }): Observable<UserMessage>;
  createUser(request: {
    input: { name: string; email: string; phone: string; externalId: string };
  }): Observable<UserMessage>;
}

@Injectable()
export class UsersGrpcClient implements UserReadPort, OnModuleInit {
  private readonly logger = new Logger(UsersGrpcClient.name);
  private userService?: UserServiceClient;

  constructor(
    @Inject('USERS_GRPC_CLIENT') private readonly grpcClient: ClientGrpc,
  ) {}

  onModuleInit(): void {
    this.userService =
      this.grpcClient.getService<UserServiceClient>('UserService');
  }

  async findAll(): Promise<UserOutput[]> {
    if (!this.userService) {
      this.logger.warn('User Service unavailable, using fallback data');
      return USERS;
    }

    try {
      const response = await firstValueFrom(this.userService.findAllUsers({}));
      return response.users.map((user) => this.toOutput(user));
    } catch (err) {
      this.logger.error('Failed to fetch users from User Service', err);
      return USERS;
    }
  }

  async findById(userId: string): Promise<UserOutput | null> {
    if (!this.userService) {
      this.logger.warn('User Service unavailable, using fallback data');
      return USERS.find((user) => user.id === userId) ?? null;
    }

    try {
      const user = await firstValueFrom(
        this.userService.findUserById({ id: userId }),
      );
      return this.toOutput(user);
    } catch (err) {
      this.logger.error(
        `Failed to fetch user ${userId} from User Service`,
        err,
      );
      return USERS.find((user) => user.id === userId) ?? null;
    }
  }

  async findByIds(userIds: string[]): Promise<UserOutput[]> {
    const uniqueIds = new Set(userIds);

    if (!this.userService) {
      this.logger.warn('User Service unavailable, using fallback data');
      return USERS.filter((user) => uniqueIds.has(user.id));
    }

    try {
      const response = await firstValueFrom(this.userService.findAllUsers({}));
      return response.users
        .map((user) => this.toOutput(user))
        .filter((user) => uniqueIds.has(user.id));
    } catch (err) {
      this.logger.error('Failed to fetch users from User Service', err);
      return USERS.filter((user) => uniqueIds.has(user.id));
    }
  }

  async findByExternalId(externalId: string): Promise<UserOutput | null> {
    if (!this.userService) return null;

    try {
      const user = await firstValueFrom(
        this.userService.findUserByExternalId({ externalId }),
      );
      return this.toOutput(user);
    } catch {
      return null;
    }
  }

  async create(data: CreateUserData): Promise<UserOutput> {
    if (!this.userService) {
      throw new Error('User Service unavailable');
    }

    const user = await firstValueFrom(
      this.userService.createUser({
        input: {
          name: data.name,
          email: data.email,
          phone: '',
          externalId: data.externalId,
        },
      }),
    );

    return this.toOutput(user);
  }

  private toOutput(message: UserMessage): UserOutput {
    return toUserOutput(new UserEntity(message.id, message.name));
  }
}
