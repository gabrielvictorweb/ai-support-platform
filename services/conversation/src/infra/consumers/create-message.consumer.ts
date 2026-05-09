import { Controller, Logger } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { CreateMessageUseCase } from '../../application/usecases/create-message.usecase';
import { type CreateMessageEvent } from '../libs/rabbitmq/rabbitmq.interfaces';
import { type MessageOutput } from '../../application/dtos';
import { RABBITMQ_CREATE_MESSAGE_PATTERN } from '../libs/rabbitmq/rabbitmq.constants';
import { ChatGateway } from '../../interface/gateways/chat.gateway';

@Controller()
export class CreateMessageConsumer {
    private readonly logger = new Logger(CreateMessageConsumer.name);

    constructor(
        private readonly createMessageUseCase: CreateMessageUseCase,
        private readonly chatGateway: ChatGateway,
    ) {}

    @MessagePattern(RABBITMQ_CREATE_MESSAGE_PATTERN)
    async execute(
        @Payload() event: CreateMessageEvent,
    ): Promise<MessageOutput> {
        this.logger.log(
            `Received message creation event for conversation ${event.conversationId}`,
        );

        try {
            const createdMessage = await this.createMessageUseCase.execute({
                conversationId: event.conversationId,
                content: event.content,
            });

            this.logger.log(`Message persisted: ${createdMessage.id}`);

            this.chatGateway.emitMessageCreated(createdMessage);

            this.logger.log(
                `Message dispatched to websocket clients: ${createdMessage.id}`,
            );

            return createdMessage;
        } catch (error) {
            const errorMessage =
                error instanceof Error ? error.message : 'unknown error';

            this.logger.error(
                `Failed to persist message for conversation ${event.conversationId}: ${errorMessage}`,
            );

            throw error;
        }
    }
}
