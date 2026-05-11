import { ValidationPipe } from '@nestjs/common';

export function createValidationPipe() {
    const isProd = process.env.NODE_ENV === 'production';

    return new ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: isProd,
        transform: true,
        transformOptions: {
            enableImplicitConversion: true,
        },
        forbidUnknownValues: true,
        disableErrorMessages: isProd,
        stopAtFirstError: isProd,
        validationError: {
            target: false,
            value: false,
        },
    });
}
