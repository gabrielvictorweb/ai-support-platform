import { Controller, NotFoundException } from '@nestjs/common';
import { GrpcMethod } from '@nestjs/microservices';
import { RejectInviteUseCase } from '../../../application/usecases/reject-invite.usecase';
import { type UpdateInviteStatusInput } from '../../../application/dtos';
import { InvitePresenter } from 'src/interface/presenters/invite.presenter';

@Controller()
export class RejectInviteGrpcController {
    constructor(private readonly rejectInviteUseCase: RejectInviteUseCase) {}

    @GrpcMethod('InviteService', 'RejectInvite')
    async execute(request: UpdateInviteStatusInput) {
        const invite = await this.rejectInviteUseCase.execute({
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
