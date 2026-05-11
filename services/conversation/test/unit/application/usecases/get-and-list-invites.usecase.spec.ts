import { Test, TestingModule } from '@nestjs/testing';
import { GetInviteUseCase } from '../../../../src/application/usecases/get-invite.usecase';
import { ListInvitesByConversationUseCase } from '../../../../src/application/usecases/list-invites-by-conversation.usecase';
import {
    Invite,
    InviteStatus,
} from '../../../../src/domain/entities/invite.entity';
import {
    type GetInviteDto,
    type ListInvitesByConversationDto,
    toInviteOutput,
} from '../../../../src/application/dtos';
import {
    type IFindInviteById,
    type IFindInvitesByConversationId,
} from '../../../../src/application/ports/output';

describe('GetInviteUseCase & ListInvitesByConversationUseCase', () => {
    let getUseCase: GetInviteUseCase;
    let listUseCase: ListInvitesByConversationUseCase;
    let findInviteById: jest.Mocked<IFindInviteById>;
    let findInvitesByConversationId: jest.Mocked<IFindInvitesByConversationId>;

    beforeEach(async () => {
        findInviteById = {
            findById: jest.fn(),
        };

        findInvitesByConversationId = {
            findByConversationId: jest.fn(),
        };

        const module: TestingModule = await Test.createTestingModule({
            providers: [
                GetInviteUseCase,
                ListInvitesByConversationUseCase,
                {
                    provide: 'FindInviteById',
                    useValue: findInviteById,
                },
                {
                    provide: 'FindInvitesByConversationId',
                    useValue: findInvitesByConversationId,
                },
            ],
        }).compile();

        getUseCase = module.get(GetInviteUseCase);
        listUseCase = module.get(ListInvitesByConversationUseCase);
    });

    it('should get an invite by id', async () => {
        const input: GetInviteDto = { id: 'invite-1' };
        const mockInvite: Invite = {
            id: input.id,
            conversationId: 'conv-1',
            userId: 'user-1',
            status: InviteStatus.PENDING,
            createdAt: new Date(),
            updatedAt: new Date(),
        };

        findInviteById.findById.mockResolvedValue(mockInvite);

        const result = await getUseCase.execute(input);

        expect(result).toEqual(toInviteOutput(mockInvite));
        expect(findInviteById.findById).toHaveBeenCalledWith(input.id);
    });

    it('should return null when invite does not exist', async () => {
        findInviteById.findById.mockResolvedValue(null);

        const result = await getUseCase.execute({ id: 'missing-invite' });

        expect(result).toBeNull();
    });

    it('should list invites by conversationId', async () => {
        const input: ListInvitesByConversationDto = {
            conversationId: 'conv-1',
        };
        const mockInvites: Invite[] = [
            {
                id: 'invite-1',
                conversationId: input.conversationId,
                userId: 'user-1',
                status: InviteStatus.PENDING,
                createdAt: new Date(),
                updatedAt: new Date(),
            },
            {
                id: 'invite-2',
                conversationId: input.conversationId,
                userId: 'user-2',
                status: InviteStatus.PENDING,
                createdAt: new Date(),
                updatedAt: new Date(),
            },
        ];

        findInvitesByConversationId.findByConversationId.mockResolvedValue(
            mockInvites,
        );

        const result = await listUseCase.execute(input);

        expect(result).toEqual(
            mockInvites.map((invite) => toInviteOutput(invite)),
        );
        expect(
            findInvitesByConversationId.findByConversationId,
        ).toHaveBeenCalledWith(input.conversationId);
    });
});
