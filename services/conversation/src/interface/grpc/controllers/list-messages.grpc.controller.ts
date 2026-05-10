import { Controller } from '@nestjs/common';
import { GrpcMethod } from '@nestjs/microservices';
import { ListMessagesUseCase } from '../../../application/usecases/list-messages.usecase';
import { type ListMessagesDto } from '../../../application/dtos';
import { MessageConnectionPresenter } from 'src/interface/presenters/messageConnection.presenter';

@Controller()
export class ListMessagesGrpcController {
    constructor(private readonly listMessagesUseCase: ListMessagesUseCase) {}

    @GrpcMethod('MessageService', 'ListMessages')
    async execute(request: ListMessagesDto) {
        const connection = await this.listMessagesUseCase.execute({
            cursor: request.cursor,
            limit: request.limit,
        });

        return MessageConnectionPresenter.toGrpcResponse(connection);
    }
}
