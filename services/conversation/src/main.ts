import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';
import { RABBITMQ_QUEUE } from './infra/libs/rabbitmq/rabbitmq.constants';
import { createValidationPipe } from './config/validation-pipe.config';
import { join } from 'path';
import { readFileSync } from 'node:fs';
import * as grpc from '@grpc/grpc-js';

function buildGrpcServerCredentials(): grpc.ServerCredentials {
    const ca = process.env.GRPC_CA_CERT;
    const key = process.env.GRPC_SERVER_KEY;
    const cert = process.env.GRPC_SERVER_CERT;

    if (ca && key && cert) {
        return grpc.ServerCredentials.createSsl(
            readFileSync(ca),
            [
                {
                    cert_chain: readFileSync(cert),
                    private_key: readFileSync(key),
                },
            ],
            true,
        );
    }

    return grpc.ServerCredentials.createInsecure();
}

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
            protoPath: join(__dirname, 'presentation/grpc/conversation.proto'),
            credentials: buildGrpcServerCredentials(),
        },
    });

    app.useGlobalPipes(createValidationPipe());

    await app.startAllMicroservices();

    await app.listen(process.env.PORT ?? 3000);
}
bootstrap().catch((err) => {
    console.error(err);
});
