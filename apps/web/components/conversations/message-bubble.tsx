import { cn } from "@/lib/utils";
import type { ChatMessage } from "@/lib/graphql/chat";

function formatTime(iso: string): string {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return "";
  return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
}

export function MessageBubble({
  message,
  meId,
  senderName,
}: {
  message: ChatMessage;
  meId: string;
  senderName?: string;
}) {
  // senderId null = mensagem de sistema (ex.: boas-vindas seedadas).
  if (!message.senderId) {
    return (
      <div className="flex justify-center py-1">
        <span className="rounded-full bg-bubble px-3 py-1 text-center font-mono text-[11px] text-muted">
          {message.content}
        </span>
      </div>
    );
  }

  const mine = message.senderId === meId;

  return (
    <div
      className={cn(
        "flex animate-settle flex-col gap-0.5",
        mine ? "items-end" : "items-start"
      )}
    >
      {!mine && senderName ? (
        <span className="px-1 text-xs font-medium text-muted">
          {senderName}
        </span>
      ) : null}
      <div
        className={cn(
          "max-w-[78%] rounded-2xl px-3.5 py-2 text-sm leading-relaxed shadow-sm",
          mine
            ? "rounded-br-sm bg-iris text-white"
            : "rounded-bl-sm bg-bubble text-bubble-fg"
        )}
      >
        {message.content}
      </div>
      <span className="px-1 font-mono text-[10px] text-muted">
        {formatTime(message.createdAt)}
      </span>
    </div>
  );
}
