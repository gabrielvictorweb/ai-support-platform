import { INestApplication } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';
import { join } from 'path';
import * as grpc from '@grpc/grpc-js';
import * as protoLoader from '@grpc/proto-loader';

import { CreateConversationGrpcController } from '../../src/interface/grpc/controllers/create-conversation.grpc.controller';
import { GetConversationGrpcController } from '../../src/interface/grpc/controllers/get-conversation.grpc.controller';
import { ListConversationsGrpcController } from '../../src/interface/grpc/controllers/list-conversations.grpc.controller';
import { UpdateConversationGrpcController } from '../../src/interface/grpc/controllers/update-conversation.grpc.controller';
import { DeleteConversationGrpcController } from '../../src/interface/grpc/controllers/delete-conversation.grpc.controller';

import { CreateConversationUseCase } from '../../src/application/usecases/create-conversation.usecase';
import { GetConversationUseCase } from '../../src/application/usecases/get-conversation.usecase';
import { ListConversationsUseCase } from '../../src/application/usecases/list-conversations.usecase';
import { UpdateConversationUseCase } from '../../src/application/usecases/update-conversation.usecase';
import { DeleteConversationUseCase } from '../../src/application/usecases/delete-conversation.usecase';

import {
    ConversationOutput,
    DeleteResultOutput,
} from '../../src/application/dtos';

type ConversationServiceClient = grpc.Client & {
    CreateConversation: (
        request: { participantIds?: string[] },
        callback: (err: grpc.ServiceError | null, response: any) => void,
    ) => void;
    GetConversation: (
        request: { id: string },
        callback: (err: grpc.ServiceError | null, response: any) => void,
    ) => void;
    ListConversations: (
        request: Record<string, never>,
        callback: (err: grpc.ServiceError | null, response: any) => void,
    ) => void;
    UpdateConversation: (
        request: { id: string; participantIds?: string[] },
        callback: (err: grpc.ServiceError | null, response: any) => void,
    ) => void;
    DeleteConversation: (
        request: { id: string },
        callback: (err: grpc.ServiceError | null, response: any) => void,
    ) => void;
};

describe('Conversation gRPC (e2e)', () => {
    let app: INestApplication;
    let client: ConversationServiceClient;
    const port = 50061;

    const createConversationUseCase = { execute: jest.fn() };
    const getConversationUseCase = { execute: jest.fn() };
    const listConversationsUseCase = { execute: jest.fn() };
    const updateConversationUseCase = { execute: jest.fn() };
    const deleteConversationUseCase = { execute: jest.fn() };

    beforeAll(async () => {
        const moduleFixture: TestingModule = await Test.createTestingModule({
            controllers: [
                CreateConversationGrpcController,
                GetConversationGrpcController,
                ListConversationsGrpcController,
                UpdateConversationGrpcController,
                DeleteConversationGrpcController,
            ],
            providers: [
                {
                    provide: CreateConversationUseCase,
                    useValue: createConversationUseCase,
                },
                {
                    provide: GetConversationUseCase,
                    useValue: getConversationUseCase,
                },
                {
                    provide: ListConversationsUseCase,
                    useValue: listConversationsUseCase,
                },
                {
                    provide: UpdateConversationUseCase,
                    useValue: updateConversationUseCase,
                },
                {
                    provide: DeleteConversationUseCase,
                    useValue: deleteConversationUseCase,
                },
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

        client = new proto.conversation.ConversationService(
            `localhost:${port}`,
            grpc.credentials.createInsecure(),
        ) as ConversationServiceClient;
    });

    afterAll(async () => {
        client.close();
        await app.close();
    });

    it('should create a conversation', async () => {
        const output: ConversationOutput = {
            id: 'conv-1',
            participantIds: ['user-1'],
            createdAt: new Date('2025-01-01T00:00:00.000Z'),
            updatedAt: new Date('2025-01-02T00:00:00.000Z'),
        };

        createConversationUseCase.execute.mockResolvedValue(output);

        const response = await new Promise<any>((resolve, reject) => {
            client.CreateConversation(
                { participantIds: ['user-1'] },
                (err, res) => (err ? reject(err) : resolve(res)),
            );
        });

        expect(response).toEqual({
            conversation: {
                id: 'conv-1',
                participantIds: ['user-1'],
                createdAt: '2025-01-01T00:00:00.000Z',
                updatedAt: '2025-01-02T00:00:00.000Z',
            },
        });
    });

    it('should get a conversation', async () => {
        const output: ConversationOutput = {
            id: 'conv-2',
            participantIds: [],
            createdAt: new Date('2025-01-01T00:00:00.000Z'),
            updatedAt: new Date('2025-01-02T00:00:00.000Z'),
        };

        getConversationUseCase.execute.mockResolvedValue(output);

        const response = await new Promise<any>((resolve, reject) => {
            client.GetConversation({ id: 'conv-2' }, (err, res) =>
                err ? reject(err) : resolve(res),
            );
        });

        expect(response.conversation.id).toBe('conv-2');
    });

    it('should return not found when conversation is missing', async () => {
        getConversationUseCase.execute.mockResolvedValue(null);

        await new Promise<void>((resolve) => {
            client.GetConversation({ id: 'missing' }, (err) => {
                expect(err).toBeTruthy();
                expect(err?.message).toContain('not found');
                resolve();
            });
        });
    });

    it('should list conversations', async () => {
        const output: ConversationOutput[] = [
            {
                id: 'conv-3',
                participantIds: ['user-1'],
                createdAt: new Date('2025-01-01T00:00:00.000Z'),
                updatedAt: new Date('2025-01-02T00:00:00.000Z'),
            },
        ];

        listConversationsUseCase.execute.mockResolvedValue(output);

        const response = await new Promise<any>((resolve, reject) => {
            client.ListConversations({}, (err, res) =>
                err ? reject(err) : resolve(res),
            );
        });

        expect(response.items).toHaveLength(1);
        expect(response.items[0]?.id).toBe('conv-3');
    });

    it('should update a conversation', async () => {
        const output: ConversationOutput = {
            id: 'conv-4',
            participantIds: ['user-2'],
            createdAt: new Date('2025-01-01T00:00:00.000Z'),
            updatedAt: new Date('2025-01-02T00:00:00.000Z'),
        };

        updateConversationUseCase.execute.mockResolvedValue(output);

        const response = await new Promise<any>((resolve, reject) => {
            client.UpdateConversation(
                { id: 'conv-4', participantIds: ['user-2'] },
                (err, res) => (err ? reject(err) : resolve(res)),
            );
        });

        expect(response.conversation.id).toBe('conv-4');
    });

    it('should delete a conversation', async () => {
        const output: DeleteResultOutput = { success: true };

        deleteConversationUseCase.execute.mockResolvedValue(output);

        const response = await new Promise<any>((resolve, reject) => {
            client.DeleteConversation({ id: 'conv-5' }, (err, res) =>
                err ? reject(err) : resolve(res),
            );
        });

        expect(response).toEqual({ success: true });
    });
});
