import { Controller } from '@nestjs/common';
import { GrpcMethod } from '@nestjs/microservices';
import { GetMessageUseCase } from '../../../application/usecases/get-message.usecase';
import { type GetMessageInput } from '../../../application/dtos';
import { MessagePresenter } from 'src/interface/presenters/message.presenter';

@Controller()
export class GetMessageGrpcController {
    constructor(private readonly getMessageUseCase: GetMessageUseCase) {}

    @GrpcMethod('MessageService', 'GetMessage')
    async execute(request: GetMessageInput) {
        const message = await this.getMessageUseCase.execute({
            id: request.id,
        });

        return MessagePresenter.toGrpcResponse(message);
    }
}
