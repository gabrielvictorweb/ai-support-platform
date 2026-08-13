"use client";

import { cn } from "@/lib/utils";
import { Avatar } from "@/components/ui/avatar";
import { conversationTitle, type ConversationView } from "./types";

function formatWhen(iso: string): string {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return "";
  const today = new Date();
  const sameDay = date.toDateString() === today.toDateString();
  return sameDay
    ? date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
    : date.toLocaleDateString([], { day: "2-digit", month: "2-digit" });
}

export function ConversationList({
  conversations,
  activeId,
  meId,
  userNames,
  onlineUserIds,
  onSelect,
}: {
  conversations: ConversationView[];
  activeId: string | null;
  meId: string;
  userNames: Record<string, string>;
  onlineUserIds: Set<string>;
  onSelect: (id: string) => void;
}) {
  return (
    <nav className="flex h-full flex-col">
      {conversations.length === 0 ? (
        <p className="px-4 py-6 text-sm text-ink-muted">
          Você ainda não tem conversas.
        </p>
      ) : (
        <ul className="flex-1 overflow-y-auto py-2">
          {conversations.map((conversation) => {
            const title = conversationTitle(conversation, meId, userNames);
            const others = conversation.participantIds.filter(
              (id) => id !== meId
            );
            const online = others.some((id) => onlineUserIds.has(id));
            const active = conversation.id === activeId;

            return (
              <li key={conversation.id}>
                <button
                  type="button"
                  onClick={() => onSelect(conversation.id)}
                  aria-current={active}
                  className={cn(
                    "flex w-full items-center gap-3 px-3 py-2.5 text-left transition-colors",
                    active ? "bg-ink-soft" : "hover:bg-ink-soft/60"
                  )}
                >
                  <div className="relative">
                    <Avatar name={title} seed={others[0] ?? conversation.id} />
                    {online ? (
                      <span className="dot-live absolute -bottom-0.5 -right-0.5 h-3 w-3 rounded-full border-2 border-ink bg-live" />
                    ) : null}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-baseline justify-between gap-2">
                      <span className="truncate text-sm font-medium text-neutral-100">
                        {title}
                      </span>
                      <span className="shrink-0 font-mono text-[10px] text-ink-muted">
                        {formatWhen(conversation.updatedAt)}
                      </span>
                    </div>
                    <span className="block truncate font-mono text-[11px] text-ink-muted">
                      {online ? "online" : `#${conversation.id.slice(0, 8)}`}
                    </span>
                  </div>
                </button>
              </li>
            );
          })}
        </ul>
      )}
    </nav>
  );
}
