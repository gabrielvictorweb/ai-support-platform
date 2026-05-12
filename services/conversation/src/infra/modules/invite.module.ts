import { Module } from '@nestjs/common';
import { InviteRepository } from '../../infra/repositories/invite.repository';
import { CreateInviteUseCase } from '../../application/usecases/create-invite.usecase';
import { GetInviteUseCase } from '../../application/usecases/get-invite.usecase';
import { ListInvitesByConversationUseCase } from '../../application/usecases/list-invites-by-conversation.usecase';
import { AcceptInviteUseCase } from '../../application/usecases/accept-invite.usecase';
import { RejectInviteUseCase } from '../../application/usecases/reject-invite.usecase';
import { PrismaModule } from './prisma.module';
import { CreateInviteGrpcController } from '../../presentation/grpc/controllers/create-invite.grpc.controller';
import { GetInviteGrpcController } from '../../presentation/grpc/controllers/get-invite.grpc.controller';
import { ListInvitesByConversationGrpcController } from '../../presentation/grpc/controllers/list-invites-by-conversation.grpc.controller';
import { AcceptInviteGrpcController } from '../../presentation/grpc/controllers/accept-invite.grpc.controller';
import { RejectInviteGrpcController } from '../../presentation/grpc/controllers/reject-invite.grpc.controller';

@Module({
    imports: [PrismaModule],
    controllers: [
        CreateInviteGrpcController,
        GetInviteGrpcController,
        ListInvitesByConversationGrpcController,
        AcceptInviteGrpcController,
        RejectInviteGrpcController,
    ],
    providers: [
        InviteRepository,
        {
            provide: 'CreateInvite',
            useClass: InviteRepository,
        },
        {
            provide: 'FindInvitesByConversationId',
            useClass: InviteRepository,
        },
        {
            provide: 'FindInviteById',
            useClass: InviteRepository,
        },
        {
            provide: 'UpdateInviteStatus',
            useClass: InviteRepository,
        },
        {
            provide: 'RejectInvite',
            useClass: InviteRepository,
        },
        {
            provide: 'AcceptInvite',
            useClass: InviteRepository,
        },
        CreateInviteUseCase,
        GetInviteUseCase,
        ListInvitesByConversationUseCase,
        AcceptInviteUseCase,
        RejectInviteUseCase,
    ],
})
export class InviteModule {}
