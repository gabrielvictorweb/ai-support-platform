import { Controller } from '@nestjs/common';
import { GrpcMethod } from '@nestjs/microservices';
import { CreateInviteUseCase } from '../../../application/usecases/create-invite.usecase';
import { type CreateInviteDto } from '../../../application/dtos';
import { InvitePresenter } from 'src/presentation/presenters/invite.presenter';

@Controller()
export class CreateInviteGrpcController {
    constructor(private readonly createInviteUseCase: CreateInviteUseCase) {}

    @GrpcMethod('InviteService', 'CreateInvite')
    async execute(request: CreateInviteDto) {
        const invite = await this.createInviteUseCase.execute({
            conversationId: request.conversationId,
            userId: request.userId,
        });

        return InvitePresenter.toGrpcResponse(invite);
    }
}
