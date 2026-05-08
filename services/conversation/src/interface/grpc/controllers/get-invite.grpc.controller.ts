import { Controller, NotFoundException } from '@nestjs/common';
import { GrpcMethod } from '@nestjs/microservices';
import { GetInviteUseCase } from '../../../application/usecases/get-invite.usecase';
import { type GetInviteInput } from '../../../application/dtos';
import { InvitePresenter } from 'src/interface/presenters/invite.presenter';

@Controller()
export class GetInviteGrpcController {
    constructor(private readonly getInviteUseCase: GetInviteUseCase) {}

    @GrpcMethod('InviteService', 'GetInvite')
    async execute(request: GetInviteInput) {
        const invite = await this.getInviteUseCase.execute({ id: request.id });

        if (!invite) {
            throw new NotFoundException(
                `Invite with id ${request.id} not found`,
            );
        }

        return InvitePresenter.toGrpcResponse(invite);
    }
}
