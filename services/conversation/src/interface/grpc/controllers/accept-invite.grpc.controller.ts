import { Controller, NotFoundException } from '@nestjs/common';
import { GrpcMethod } from '@nestjs/microservices';
import { AcceptInviteUseCase } from '../../../application/usecases/accept-invite.usecase';
import { type UpdateInviteStatusInput } from '../../../application/dtos';
import { InvitePresenter } from 'src/interface/presenters/invite.presenter';

@Controller()
export class AcceptInviteGrpcController {
    constructor(private readonly acceptInviteUseCase: AcceptInviteUseCase) {}

    @GrpcMethod('InviteService', 'AcceptInvite')
    async execute(request: UpdateInviteStatusInput) {
        const invite = await this.acceptInviteUseCase.execute({
            id: request.id,
        });

        if (!invite) {
            throw new NotFoundException(
                `Invite with id ${request.id} not found`,
            );
        }

        return InvitePresenter.toGrpcResponse(invite);
    }
}
