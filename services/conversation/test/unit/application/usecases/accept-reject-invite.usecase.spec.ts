import { Test, TestingModule } from '@nestjs/testing';
import { AcceptInviteUseCase } from '../../../../src/application/usecases/accept-invite.usecase';
import { RejectInviteUseCase } from '../../../../src/application/usecases/reject-invite.usecase';
import {
    Invite,
    InviteStatus,
} from '../../../../src/domain/entities/invite.entity';
import {
    type UpdateInviteStatusDto,
    toInviteOutput,
} from '../../../../src/application/dtos';
import { type IUpdateInviteStatus } from '../../../../src/application/ports/output';

describe('AcceptInviteUseCase & RejectInviteUseCase', () => {
    let acceptUseCase: AcceptInviteUseCase;
    let rejectUseCase: RejectInviteUseCase;
    let acceptInvite: jest.Mocked<IUpdateInviteStatus>;
    let rejectInvite: jest.Mocked<IUpdateInviteStatus>;

    beforeEach(async () => {
        acceptInvite = {
            updateStatus: jest.fn(),
        };

        rejectInvite = {
            updateStatus: jest.fn(),
        };

        const module: TestingModule = await Test.createTestingModule({
            providers: [
                AcceptInviteUseCase,
                RejectInviteUseCase,
                {
                    provide: 'AcceptInvite',
                    useValue: acceptInvite,
                },
                {
                    provide: 'RejectInvite',
                    useValue: rejectInvite,
                },
            ],
        }).compile();

        acceptUseCase = module.get(AcceptInviteUseCase);
        rejectUseCase = module.get(RejectInviteUseCase);
    });

    it('should accept an invite', async () => {
        const input: UpdateInviteStatusDto = { id: 'invite-1' };
        const mockInvite: Invite = {
            id: input.id,
            conversationId: 'conv-1',
            userId: 'user-1',
            status: InviteStatus.ACCEPTED,
            createdAt: new Date(),
            updatedAt: new Date(),
        };

        acceptInvite.updateStatus.mockResolvedValue(mockInvite);

        const result = await acceptUseCase.execute(input);

        expect(result).toEqual(toInviteOutput(mockInvite));
        expect(acceptInvite.updateStatus).toHaveBeenCalledWith(
            input.id,
            InviteStatus.ACCEPTED,
        );
    });

    it('should return null when accept invite does not exist', async () => {
        acceptInvite.updateStatus.mockResolvedValue(null);

        const result = await acceptUseCase.execute({ id: 'missing-invite' });

        expect(result).toBeNull();
    });

    it('should reject an invite', async () => {
        const input: UpdateInviteStatusDto = { id: 'invite-2' };
        const mockInvite: Invite = {
            id: input.id,
            conversationId: 'conv-1',
            userId: 'user-2',
            status: InviteStatus.REJECTED,
            createdAt: new Date(),
            updatedAt: new Date(),
        };

        rejectInvite.updateStatus.mockResolvedValue(mockInvite);

        const result = await rejectUseCase.execute(input);

        expect(result).toEqual(toInviteOutput(mockInvite));
        expect(rejectInvite.updateStatus).toHaveBeenCalledWith(
            input.id,
            InviteStatus.REJECTED,
        );
    });

    it('should return null when reject invite does not exist', async () => {
        rejectInvite.updateStatus.mockResolvedValue(null);

        const result = await rejectUseCase.execute({ id: 'missing-invite' });

        expect(result).toBeNull();
    });
});
