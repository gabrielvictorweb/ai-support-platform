import { INestApplication } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';
import { join } from 'path';
import * as grpc from '@grpc/grpc-js';
import * as protoLoader from '@grpc/proto-loader';

import { CreateMessageGrpcController } from '../../src/interface/grpc/controllers/create-message.grpc.controller';
import { GetMessageGrpcController } from '../../src/interface/grpc/controllers/get-message.grpc.controller';
import { ListMessagesGrpcController } from '../../src/interface/grpc/controllers/list-messages.grpc.controller';
import { ListMessagesByConversationGrpcController } from '../../src/interface/grpc/controllers/list-messages-by-conversation.grpc.controller';
import { UpdateMessageGrpcController } from '../../src/interface/grpc/controllers/update-message.grpc.controller';
import { DeleteMessageGrpcController } from '../../src/interface/grpc/controllers/delete-message.grpc.controller';

import { CreateMessageUseCase } from '../../src/application/usecases/create-message.usecase';
import { GetMessageUseCase } from '../../src/application/usecases/get-message.usecase';
import { ListMessagesUseCase } from '../../src/application/usecases/list-messages.usecase';
import { ListMessagesByConversationUseCase } from '../../src/application/usecases/list-messages-by-conversation.usecase';
import { UpdateMessageUseCase } from '../../src/application/usecases/update-message.usecase';
import { DeleteMessageUseCase } from '../../src/application/usecases/delete-message.usecase';

import {
    MessageConnectionOutput,
    MessageOutput,
    DeleteResultOutput,
} from '../../src/application/dtos';

type MessageServiceClient = grpc.Client & {
    CreateMessage: (
        request: { conversationId: string; content: string },
        callback: (err: grpc.ServiceError | null, response: any) => void,
    ) => void;
    GetMessage: (
        request: { id: string },
        callback: (err: grpc.ServiceError | null, response: any) => void,
    ) => void;
    ListMessages: (
        request: { cursor?: string; limit?: number },
        callback: (err: grpc.ServiceError | null, response: any) => void,
    ) => void;
    ListMessagesByConversation: (
        request: { conversationId: string; cursor?: string; limit?: number },
        callback: (err: grpc.ServiceError | null, response: any) => void,
    ) => void;
    UpdateMessage: (
        request: { id: string; content?: string },
        callback: (err: grpc.ServiceError | null, response: any) => void,
    ) => void;
    DeleteMessage: (
        request: { id: string },
        callback: (err: grpc.ServiceError | null, response: any) => void,
    ) => void;
};

describe('Message gRPC (e2e)', () => {
    let app: INestApplication;
    let client: MessageServiceClient;
    const port = 50065;

    const createMessageUseCase = { execute: jest.fn() };
    const getMessageUseCase = { execute: jest.fn() };
    const listMessagesUseCase = { execute: jest.fn() };
    const listMessagesByConversationUseCase = { execute: jest.fn() };
    const updateMessageUseCase = { execute: jest.fn() };
    const deleteMessageUseCase = { execute: jest.fn() };

    beforeAll(async () => {
        const moduleFixture: TestingModule = await Test.createTestingModule({
            controllers: [
                CreateMessageGrpcController,
                GetMessageGrpcController,
                ListMessagesGrpcController,
                ListMessagesByConversationGrpcController,
                UpdateMessageGrpcController,
                DeleteMessageGrpcController,
            ],
            providers: [
                {
                    provide: CreateMessageUseCase,
                    useValue: createMessageUseCase,
                },
                { provide: GetMessageUseCase, useValue: getMessageUseCase },
                { provide: ListMessagesUseCase, useValue: listMessagesUseCase },
                {
                    provide: ListMessagesByConversationUseCase,
                    useValue: listMessagesByConversationUseCase,
                },
                {
                    provide: UpdateMessageUseCase,
                    useValue: updateMessageUseCase,
                },
                {
                    provide: DeleteMessageUseCase,
                    useValue: deleteMessageUseCase,
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

        client = new proto.conversation.MessageService(
            `localhost:${port}`,
            grpc.credentials.createInsecure(),
        ) as MessageServiceClient;
    });

    afterAll(async () => {
        client.close();
        await app.close();
    });

    it('should create a message', async () => {
        const output: MessageOutput = {
            id: 'msg-1',
            conversationId: 'conv-1',
            content: 'hello',
            createdAt: new Date('2025-01-01T00:00:00.000Z'),
            updatedAt: new Date('2025-01-02T00:00:00.000Z'),
        };

        createMessageUseCase.execute.mockResolvedValue(output);

        const response = await new Promise<any>((resolve, reject) => {
            client.CreateMessage(
                { conversationId: 'conv-1', content: 'hello' },
                (err, res) => (err ? reject(err) : resolve(res)),
            );
        });

        expect(response.message.id).toBe('msg-1');
    });

    it('should get a message', async () => {
        const output: MessageOutput = {
            id: 'msg-2',
            conversationId: 'conv-1',
            content: 'hello',
            createdAt: new Date('2025-01-01T00:00:00.000Z'),
            updatedAt: new Date('2025-01-02T00:00:00.000Z'),
        };

        getMessageUseCase.execute.mockResolvedValue(output);

        const response = await new Promise<any>((resolve, reject) => {
            client.GetMessage({ id: 'msg-2' }, (err, res) =>
                err ? reject(err) : resolve(res),
            );
        });

        expect(response.message.id).toBe('msg-2');
    });

    it('should list messages', async () => {
        const output: MessageConnectionOutput = {
            items: [
                {
                    id: 'msg-3',
                    conversationId: 'conv-1',
                    content: 'hello',
                    createdAt: new Date('2025-01-01T00:00:00.000Z'),
                    updatedAt: new Date('2025-01-02T00:00:00.000Z'),
                },
            ],
            nextCursor: 'msg-3',
            hasNextPage: true,
        };

        listMessagesUseCase.execute.mockResolvedValue(output);

        const response = await new Promise<any>((resolve, reject) => {
            client.ListMessages({ cursor: 'msg-2', limit: 10 }, (err, res) =>
                err ? reject(err) : resolve(res),
            );
        });

        expect(response.items).toHaveLength(1);
        expect(response.items[0]?.id).toBe('msg-3');
    });

    it('should list messages by conversation', async () => {
        const output: MessageConnectionOutput = {
            items: [
                {
                    id: 'msg-4',
                    conversationId: 'conv-2',
                    content: 'hello',
                    createdAt: new Date('2025-01-01T00:00:00.000Z'),
                    updatedAt: new Date('2025-01-02T00:00:00.000Z'),
                },
            ],
            nextCursor: '',
            hasNextPage: false,
        };

        listMessagesByConversationUseCase.execute.mockResolvedValue(output);

        const response = await new Promise<any>((resolve, reject) => {
            client.ListMessagesByConversation(
                { conversationId: 'conv-2' },
                (err, res) => (err ? reject(err) : resolve(res)),
            );
        });

        expect(response.items).toHaveLength(1);
        expect(response.items[0]?.id).toBe('msg-4');
    });

    it('should update a message', async () => {
        const output: MessageOutput = {
            id: 'msg-5',
            conversationId: 'conv-3',
            content: 'updated',
            createdAt: new Date('2025-01-01T00:00:00.000Z'),
            updatedAt: new Date('2025-01-02T00:00:00.000Z'),
        };

        updateMessageUseCase.execute.mockResolvedValue(output);

        const response = await new Promise<any>((resolve, reject) => {
            client.UpdateMessage(
                { id: 'msg-5', content: 'updated' },
                (err, res) => (err ? reject(err) : resolve(res)),
            );
        });

        expect(response.message.id).toBe('msg-5');
    });

    it('should delete a message', async () => {
        const output: DeleteResultOutput = { success: true };

        deleteMessageUseCase.execute.mockResolvedValue(output);

        const response = await new Promise<any>((resolve, reject) => {
            client.DeleteMessage({ id: 'msg-6' }, (err, res) =>
                err ? reject(err) : resolve(res),
            );
        });

        expect(response).toEqual({ success: true });
    });
});
