import { Controller } from '@nestjs/common';
import { GrpcMethod } from '@nestjs/microservices';
import { GetMessageUseCase } from '../../../application/usecases/get-message.usecase';
import { type GetMessageDto } from '../../../application/dtos';
import { MessagePresenter } from 'src/interface/presenters/message.presenter';

@Controller()
export class GetMessageGrpcController {
    constructor(private readonly getMessageUseCase: GetMessageUseCase) {}

    @GrpcMethod('MessageService', 'GetMessage')
    async execute(request: GetMessageDto) {
        const message = await this.getMessageUseCase.execute({
            id: request.id,
        });

        return MessagePresenter.toGrpcResponse(message);
    }
}
