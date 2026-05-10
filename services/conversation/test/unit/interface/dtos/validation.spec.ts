import { validate } from 'class-validator';
import { CreateConversationDto } from '../../../../src/interface/dtos/create-conversation.dto';
import { UpdateConversationDto } from '../../../../src/interface/dtos/update-conversation.dto';
import { CreateMessageDto } from '../../../../src/interface/dtos/create-message.dto';
import { UpdateMessageDto } from '../../../../src/interface/dtos/update-message.dto';
import { CreateInviteDto } from '../../../../src/interface/dtos/create-invite.dto';
import { UpdateInviteStatusDto } from '../../../../src/interface/dtos/update-invite-status.dto';

describe('Interface DTO validation', () => {
    it('should validate create conversation dto', async () => {
        const dto = new CreateConversationDto();
        dto.participantIds = ['user-1', 'user-2'];

        const errors = await validate(dto);

        expect(errors).toHaveLength(0);
    });

    it('should invalidate create conversation dto with invalid participantIds', async () => {
        const dto = new CreateConversationDto();
        dto.participantIds = ['user-1', 2 as unknown as string];

        const errors = await validate(dto);

        expect(errors.length).toBeGreaterThan(0);
    });

    it('should validate update conversation dto', async () => {
        const dto = new UpdateConversationDto();
        dto.id = 'conv-1';
        dto.participantIds = ['user-1'];

        const errors = await validate(dto);

        expect(errors).toHaveLength(0);
    });

    it('should invalidate update conversation dto when id is missing', async () => {
        const dto = new UpdateConversationDto();

        const errors = await validate(dto);

        expect(errors.length).toBeGreaterThan(0);
    });

    it('should validate create message dto', async () => {
        const dto = new CreateMessageDto();
        dto.conversationId = 'conv-1';
        dto.content = 'hello';

        const errors = await validate(dto);

        expect(errors).toHaveLength(0);
    });

    it('should invalidate create message dto when fields are empty', async () => {
        const dto = new CreateMessageDto();
        dto.conversationId = '';
        dto.content = '';

        const errors = await validate(dto);

        expect(errors.length).toBeGreaterThan(0);
    });

    it('should validate update message dto', async () => {
        const dto = new UpdateMessageDto();
        dto.id = 'msg-1';

        const errors = await validate(dto);

        expect(errors).toHaveLength(0);
    });

    it('should invalidate update message dto when id is missing', async () => {
        const dto = new UpdateMessageDto();
        dto.content = 'hello';

        const errors = await validate(dto);

        expect(errors.length).toBeGreaterThan(0);
    });

    it('should validate create invite dto', async () => {
        const dto = new CreateInviteDto();
        dto.conversationId = 'conv-1';
        dto.userId = 'user-1';

        const errors = await validate(dto);

        expect(errors).toHaveLength(0);
    });

    it('should invalidate create invite dto when fields are empty', async () => {
        const dto = new CreateInviteDto();
        dto.conversationId = '';
        dto.userId = '';

        const errors = await validate(dto);

        expect(errors.length).toBeGreaterThan(0);
    });

    it('should validate update invite status dto', async () => {
        const dto = new UpdateInviteStatusDto();
        dto.id = 'invite-1';

        const errors = await validate(dto);

        expect(errors).toHaveLength(0);
    });

    it('should invalidate update invite status dto when id is empty', async () => {
        const dto = new UpdateInviteStatusDto();
        dto.id = '';

        const errors = await validate(dto);

        expect(errors.length).toBeGreaterThan(0);
    });
});
