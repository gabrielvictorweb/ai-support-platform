import { Controller } from '@nestjs/common';
import { GrpcMethod } from '@nestjs/microservices';
import { DeleteMessageUseCase } from '../../../application/usecases/delete-message.usecase';
import {
    type DeleteMessageInput,
    type DeleteResultOutput,
} from '../../../application/dtos';

@Controller()
export class DeleteMessageGrpcController {
    constructor(private readonly deleteMessageUseCase: DeleteMessageUseCase) {}

    @GrpcMethod('MessageService', 'DeleteMessage')
    async execute(request: DeleteMessageInput): Promise<DeleteResultOutput> {
        return this.deleteMessageUseCase.execute({ id: request.id });
    }
}
