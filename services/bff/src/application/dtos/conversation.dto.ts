export interface ConversationOutput {
  id: string;
  participantIds: string[];
  createdAt: Date;
  updatedAt: Date;
}

export const toConversationOutput = (
  conversation: {
    id: string;
    participantIds: string[];
    createdAt: Date;
    updatedAt: Date;
  },
): ConversationOutput => ({
  id: conversation.id,
  participantIds: conversation.participantIds,
  createdAt: conversation.createdAt,
  updatedAt: conversation.updatedAt,
});

export interface GetConversationsByUserIdsDto {
  userIds: string[];
}
