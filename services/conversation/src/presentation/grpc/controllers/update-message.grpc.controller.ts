import { Controller, NotFoundException } from '@nestjs/common';
import { GrpcMethod } from '@nestjs/microservices';
import { UpdateMessageUseCase } from '../../../application/usecases/update-message.usecase';
import { type UpdateMessageDto } from '../../../application/dtos';
import { MessagePresenter } from 'src/presentation/presenters/message.presenter';

@Controller()
export class UpdateMessageGrpcController {
    constructor(private readonly updateMessageUseCase: UpdateMessageUseCase) {}

    @GrpcMethod('MessageService', 'UpdateMessage')
    async execute(request: UpdateMessageDto) {
        const message = await this.updateMessageUseCase.execute({
            id: request.id,
            content: request.content,
        });

        if (!message) {
            throw new NotFoundException(
                `Message with id ${request.id} not found`,
            );
        }

        return MessagePresenter.toGrpcResponse(message);
    }
}
