import { Module } from '@nestjs/common';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { ConversationRepository } from '../../infra/repositories/conversation.repository';
import { MessageRepository } from '../../infra/repositories/message.repository';
import { CreateConversationUseCase } from '../../application/usecases/create-conversation.usecase';
import { GetConversationUseCase } from '../../application/usecases/get-conversation.usecase';
import { ListConversationsUseCase } from '../../application/usecases/list-conversations.usecase';
import { UpdateConversationUseCase } from '../../application/usecases/update-conversation.usecase';
import { DeleteConversationUseCase } from '../../application/usecases/delete-conversation.usecase';
import { CreateMessageUseCase } from '../../application/usecases/create-message.usecase';
import { GetMessageUseCase } from '../../application/usecases/get-message.usecase';
import { ListMessagesUseCase } from '../../application/usecases/list-messages.usecase';
import { ListMessagesByConversationUseCase } from '../../application/usecases/list-messages-by-conversation.usecase';
import { UpdateMessageUseCase } from '../../application/usecases/update-message.usecase';
import { DeleteMessageUseCase } from '../../application/usecases/delete-message.usecase';
import { CreateMessageConsumer } from '../consumers/create-message.consumer';
import { ChatGateway } from '../../presentation/gateways/chat.gateway';
import { PrismaModule } from './prisma.module';
import { CreateConversationGrpcController } from '../../presentation/grpc/controllers/create-conversation.grpc.controller';
import { GetConversationGrpcController } from '../../presentation/grpc/controllers/get-conversation.grpc.controller';
import { ListConversationsGrpcController } from '../../presentation/grpc/controllers/list-conversations.grpc.controller';
import { UpdateConversationGrpcController } from '../../presentation/grpc/controllers/update-conversation.grpc.controller';
import { DeleteConversationGrpcController } from '../../presentation/grpc/controllers/delete-conversation.grpc.controller';
import { CreateMessageGrpcController } from '../../presentation/grpc/controllers/create-message.grpc.controller';
import { GetMessageGrpcController } from '../../presentation/grpc/controllers/get-message.grpc.controller';
import { ListMessagesGrpcController } from '../../presentation/grpc/controllers/list-messages.grpc.controller';
import { ListMessagesByConversationGrpcController } from '../../presentation/grpc/controllers/list-messages-by-conversation.grpc.controller';
import { UpdateMessageGrpcController } from '../../presentation/grpc/controllers/update-message.grpc.controller';
import { DeleteMessageGrpcController } from '../../presentation/grpc/controllers/delete-message.grpc.controller';
import {
    RABBITMQ_CLIENT,
    RABBITMQ_QUEUE,
} from '../libs/rabbitmq/rabbitmq.constants';

@Module({
    imports: [
        PrismaModule,
        ClientsModule.register([
            {
                name: RABBITMQ_CLIENT,
                transport: Transport.RMQ,
                options: {
                    urls: [process.env.RABBITMQ_URL ?? 'amqp://localhost:5672'],
                    queue: RABBITMQ_QUEUE,
                    queueOptions: {
                        durable: true,
                    },
                },
            },
        ]),
    ],
    controllers: [
        CreateMessageConsumer,
        CreateConversationGrpcController,
        GetConversationGrpcController,
        ListConversationsGrpcController,
        UpdateConversationGrpcController,
        DeleteConversationGrpcController,
        CreateMessageGrpcController,
        GetMessageGrpcController,
        ListMessagesGrpcController,
        ListMessagesByConversationGrpcController,
        UpdateMessageGrpcController,
        DeleteMessageGrpcController,
    ],
    providers: [
        ConversationRepository,
        MessageRepository,
        {
            provide: 'CreateConversation',
            useClass: ConversationRepository,
        },
        {
            provide: 'FindConversationById',
            useClass: ConversationRepository,
        },
        {
            provide: 'FindConversations',
            useClass: ConversationRepository,
        },
        {
            provide: 'UpdateConversation',
            useClass: ConversationRepository,
        },
        {
            provide: 'DeleteConversation',
            useClass: ConversationRepository,
        },
        {
            provide: 'CreateMessage',
            useClass: MessageRepository,
        },
        {
            provide: 'FindMessageById',
            useClass: MessageRepository,
        },
        {
            provide: 'FindMessagesByConversationId',
            useClass: MessageRepository,
        },
        {
            provide: 'FindMessages',
            useClass: MessageRepository,
        },
        {
            provide: 'UpdateMessage',
            useClass: MessageRepository,
        },
        {
            provide: 'DeleteMessage',
            useClass: MessageRepository,
        },
        CreateConversationUseCase,
        GetConversationUseCase,
        ListConversationsUseCase,
        UpdateConversationUseCase,
        DeleteConversationUseCase,
        CreateMessageUseCase,
        GetMessageUseCase,
        ListMessagesUseCase,
        ListMessagesByConversationUseCase,
        UpdateMessageUseCase,
        DeleteMessageUseCase,
        ChatGateway,
    ],
})
export class ConversationModule {}
