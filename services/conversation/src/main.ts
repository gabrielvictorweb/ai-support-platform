import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';
import { RABBITMQ_QUEUE } from './infra/libs/rabbitmq/rabbitmq.constants';
import { createValidationPipe } from './config/validation-pipe.config';
import { join } from 'path';

async function bootstrap() {
    const app = await NestFactory.create(AppModule);

    app.connectMicroservice<MicroserviceOptions>({
        transport: Transport.RMQ,
        options: {
            urls: [process.env.RABBITMQ_URL ?? 'amqp://localhost:5672'],
            queue: RABBITMQ_QUEUE,
            queueOptions: {
                durable: true,
            },
        },
    });

    app.connectMicroservice<MicroserviceOptions>({
        transport: Transport.GRPC,
        options: {
            url: `0.0.0.0:${process.env.GRPC_PORT ?? 50051}`,
            package: 'conversation',
            protoPath: join(__dirname, 'interface/grpc/conversation.proto'),
        },
    });

    app.useGlobalPipes(createValidationPipe());

    await app.startAllMicroservices();

    await app.listen(process.env.PORT ?? 3000);
}
bootstrap().catch((err) => {
    console.error(err);
});
