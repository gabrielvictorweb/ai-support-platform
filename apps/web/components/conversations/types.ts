export interface ConversationView {
  id: string;
  participantIds: string[];
  createdAt: string;
  updatedAt: string;
}

/** Rótulo de uma conversa: o(s) outro(s) participante(s), ou um fallback. */
export function conversationTitle(
  conversation: ConversationView,
  meId: string,
  userNames: Record<string, string>
): string {
  const others = conversation.participantIds.filter((id) => id !== meId);
  if (others.length === 0) return "Notas pessoais";
  return others
    .map((id) => userNames[id] ?? `Usuário ${id.slice(0, 6)}`)
    .join(", ");
}
