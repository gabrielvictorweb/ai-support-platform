import { Test, TestingModule } from '@nestjs/testing';
import { CreateInviteUseCase } from '../../../../src/application/usecases/create-invite.usecase';
import {
    Invite,
    InviteStatus,
} from '../../../../src/domain/entities/invite.entity';
import {
    type CreateInviteDto,
    toInviteOutput,
} from '../../../../src/application/dtos';
import { type ICreateInvite } from '../../../../src/application/ports/output';

describe('CreateInviteUseCase', () => {
    let useCase: CreateInviteUseCase;
    let createInvite: jest.Mocked<ICreateInvite>;

    beforeEach(async () => {
        createInvite = {
            create: jest.fn(),
        };

        const module: TestingModule = await Test.createTestingModule({
            providers: [
                CreateInviteUseCase,
                {
                    provide: 'CreateInvite',
                    useValue: createInvite,
                },
            ],
        }).compile();

        useCase = module.get(CreateInviteUseCase);
    });

    it('should create an invite with conversationId and userId', async () => {
        const input: CreateInviteDto = {
            conversationId: 'conv-1',
            userId: 'user-1',
        };

        const mockInvite: Invite = {
            id: 'invite-1',
            conversationId: input.conversationId,
            userId: input.userId,
            status: InviteStatus.PENDING,
            createdAt: new Date(),
            updatedAt: new Date(),
        };

        createInvite.create.mockResolvedValue(mockInvite);

        const result = await useCase.execute(input);

        expect(result).toEqual(toInviteOutput(mockInvite));
        expect(createInvite.create).toHaveBeenCalledWith({
            conversationId: input.conversationId,
            userId: input.userId,
        });
    });
});
