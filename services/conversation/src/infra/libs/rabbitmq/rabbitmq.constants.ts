export const RABBITMQ_CLIENT = 'RABBITMQ_CLIENT';

export const RABBITMQ_QUEUE =
    process.env.RABBITMQ_QUEUE ?? 'conversation-service.queue';

export const RABBITMQ_CREATE_MESSAGE_PATTERN = 'message.create';
