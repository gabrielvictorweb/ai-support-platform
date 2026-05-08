import { Invite } from 'src/domain/entities/invite.entity';
import { InviteStatus } from 'src/infra/database/generated/prisma/enums';

export interface ICreateInvite {
    create(
        data: Omit<Invite, 'id' | 'status' | 'createdAt' | 'updatedAt'>,
    ): Promise<Invite>;
}

export interface IUpdateInviteStatus {
    updateStatus(id: string, status: InviteStatus): Promise<Invite | null>;
}

export interface IDeleteInvite {
    delete(id: string): Promise<boolean>;
}

export interface IFindInviteById {
    findById(id: string): Promise<Invite | null>;
}

export interface IFindInvitesByConversationId {
    findByConversationId(conversationId: string): Promise<Invite[]>;
}
