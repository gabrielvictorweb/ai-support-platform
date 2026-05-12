import { INestApplication } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';
import { join } from 'path';
import * as grpc from '@grpc/grpc-js';
import * as protoLoader from '@grpc/proto-loader';
import { CreateInviteGrpcController } from '../../src/presentation/grpc/controllers/create-invite.grpc.controller';
import { GetInviteGrpcController } from '../../src/presentation/grpc/controllers/get-invite.grpc.controller';
import { ListInvitesByConversationGrpcController } from '../../src/presentation/grpc/controllers/list-invites-by-conversation.grpc.controller';
import { AcceptInviteGrpcController } from '../../src/presentation/grpc/controllers/accept-invite.grpc.controller';
import { RejectInviteGrpcController } from '../../src/presentation/grpc/controllers/reject-invite.grpc.controller';
import { CreateInviteUseCase } from '../../src/application/usecases/create-invite.usecase';
import { GetInviteUseCase } from '../../src/application/usecases/get-invite.usecase';
import { ListInvitesByConversationUseCase } from '../../src/application/usecases/list-invites-by-conversation.usecase';
import { AcceptInviteUseCase } from '../../src/application/usecases/accept-invite.usecase';
import { RejectInviteUseCase } from '../../src/application/usecases/reject-invite.usecase';
import { InviteOutput } from '../../src/application/dtos';
import { InviteStatus } from '../../src/domain/entities/invite.entity';

type InviteServiceClient = grpc.Client & {
    CreateInvite: (
        request: { conversationId: string; userId: string },
        callback: (err: grpc.ServiceError | null, response: any) => void,
    ) => void;
    GetInvite: (
        request: { id: string },
        callback: (err: grpc.ServiceError | null, response: any) => void,
    ) => void;
    ListInvitesByConversation: (
        request: { conversationId: string },
        callback: (err: grpc.ServiceError | null, response: any) => void,
    ) => void;
    AcceptInvite: (
        request: { id: string },
        callback: (err: grpc.ServiceError | null, response: any) => void,
    ) => void;
    RejectInvite: (
        request: { id: string },
        callback: (err: grpc.ServiceError | null, response: any) => void,
    ) => void;
};

describe('Invite gRPC (e2e)', () => {
    let app: INestApplication;
    let client: InviteServiceClient;
    const port = 50063;

    const createInviteUseCase = { execute: jest.fn() };
    const getInviteUseCase = { execute: jest.fn() };
    const listInvitesByConversationUseCase = { execute: jest.fn() };
    const acceptInviteUseCase = { execute: jest.fn() };
    const rejectInviteUseCase = { execute: jest.fn() };

    beforeAll(async () => {
        const moduleFixture: TestingModule = await Test.createTestingModule({
            controllers: [
                CreateInviteGrpcController,
                GetInviteGrpcController,
                ListInvitesByConversationGrpcController,
                AcceptInviteGrpcController,
                RejectInviteGrpcController,
            ],
            providers: [
                { provide: CreateInviteUseCase, useValue: createInviteUseCase },
                { provide: GetInviteUseCase, useValue: getInviteUseCase },
                {
                    provide: ListInvitesByConversationUseCase,
                    useValue: listInvitesByConversationUseCase,
                },
                { provide: AcceptInviteUseCase, useValue: acceptInviteUseCase },
                { provide: RejectInviteUseCase, useValue: rejectInviteUseCase },
            ],
        }).compile();

        app = moduleFixture.createNestApplication();
        app.connectMicroservice<MicroserviceOptions>({
            transport: Transport.GRPC,
            options: {
                url: `0.0.0.0:${port}`,
                package: 'conversation',
                protoPath: join(
                    __dirname,
                    '../../src/interface/grpc/conversation.proto',
                ),
            },
        });

        await app.startAllMicroservices();
        await app.init();

        const packageDefinition = protoLoader.loadSync(
            join(__dirname, '../../src/interface/grpc/conversation.proto'),
            {
                keepCase: true,
                longs: String,
                enums: String,
                defaults: true,
                oneofs: true,
            },
        );
        const proto = grpc.loadPackageDefinition(packageDefinition) as any;
        client = new proto.conversation.InviteService(
            `0.0.0.0:${port}`,
            grpc.credentials.createInsecure(),
        ) as InviteServiceClient;
    });

    afterAll(async () => {
        client.close();
        await app.close();
    });

    it('should create an invite', async () => {
        const output: InviteOutput = {
            id: 'invite-1',
            conversationId: 'conv-1',
            userId: 'user-1',
            status: InviteStatus.PENDING,
            createdAt: new Date('2025-01-01T00:00:00.000Z'),
            updatedAt: new Date('2025-01-02T00:00:00.000Z'),
        };

        createInviteUseCase.execute.mockResolvedValue(output);

        const response = await new Promise<any>((resolve, reject) => {
            client.CreateInvite(
                { conversationId: 'conv-1', userId: 'user-1' },
                (err, res) => (err ? reject(err) : resolve(res)),
            );
        });

        expect(response.invite.id).toBe('invite-1');
    });

    it('should get an invite', async () => {
        const output: InviteOutput = {
            id: 'invite-2',
            conversationId: 'conv-1',
            userId: 'user-2',
            status: InviteStatus.PENDING,
            createdAt: new Date('2025-01-01T00:00:00.000Z'),
            updatedAt: new Date('2025-01-02T00:00:00.000Z'),
        };

        getInviteUseCase.execute.mockResolvedValue(output);

        const response = await new Promise<any>((resolve, reject) => {
            client.GetInvite({ id: 'invite-2' }, (err, res) =>
                err ? reject(err) : resolve(res),
            );
        });

        expect(response.invite.id).toBe('invite-2');
    });

    it('should list invites by conversation', async () => {
        const output: InviteOutput[] = [
            {
                id: 'invite-3',
                conversationId: 'conv-3',
                userId: 'user-3',
                status: InviteStatus.PENDING,
                createdAt: new Date('2025-01-01T00:00:00.000Z'),
                updatedAt: new Date('2025-01-02T00:00:00.000Z'),
            },
        ];

        listInvitesByConversationUseCase.execute.mockResolvedValue(output);

        const response = await new Promise<any>((resolve, reject) => {
            client.ListInvitesByConversation(
                { conversationId: 'conv-3' },
                (err, res) => (err ? reject(err) : resolve(res)),
            );
        });

        expect(response.items).toHaveLength(1);
        expect(response.items[0]?.id).toBe('invite-3');
    });

    it('should accept an invite', async () => {
        const output: InviteOutput = {
            id: 'invite-4',
            conversationId: 'conv-4',
            userId: 'user-4',
            status: InviteStatus.ACCEPTED,
            createdAt: new Date('2025-01-01T00:00:00.000Z'),
            updatedAt: new Date('2025-01-02T00:00:00.000Z'),
        };

        acceptInviteUseCase.execute.mockResolvedValue(output);

        const response = await new Promise<any>((resolve, reject) => {
            client.AcceptInvite({ id: 'invite-4' }, (err, res) =>
                err ? reject(err) : resolve(res),
            );
        });

        expect(response.invite.id).toBe('invite-4');
    });

    it('should reject an invite', async () => {
        const output: InviteOutput = {
            id: 'invite-5',
            conversationId: 'conv-5',
            userId: 'user-5',
            status: InviteStatus.REJECTED,
            createdAt: new Date('2025-01-01T00:00:00.000Z'),
            updatedAt: new Date('2025-01-02T00:00:00.000Z'),
        };

        rejectInviteUseCase.execute.mockResolvedValue(output);

        const response = await new Promise<any>((resolve, reject) => {
            client.RejectInvite({ id: 'invite-5' }, (err, res) =>
                err ? reject(err) : resolve(res),
            );
        });

        expect(response.invite.id).toBe('invite-5');
    });
});
