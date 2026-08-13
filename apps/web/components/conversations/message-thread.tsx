"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useQuery } from "@apollo/client/react";
import type { Socket } from "socket.io-client";
import { MESSAGES_QUERY, type ChatMessage } from "@/lib/graphql/chat";
import type {
  MessageCreatedPayload,
  TypingPayload,
} from "@/hooks/use-chat-socket";
import { Avatar } from "@/components/ui/avatar";
import { conversationTitle, type ConversationView } from "./types";
import { MessageBubble } from "./message-bubble";
import { MessageComposer } from "./message-composer";

interface MessagesData {
  messages: ChatMessage[];
}

function TypingDots() {
  return (
    <span className="inline-flex items-center gap-1">
      {[0, 1, 2].map((i) => (
        <span
          key={i}
          className="typing-dot h-1.5 w-1.5 rounded-full bg-live"
        />
      ))}
    </span>
  );
}

export function MessageThread({
  conversation,
  meId,
  userNames,
  onlineUserIds,
  socket,
}: {
  conversation: ConversationView;
  meId: string;
  userNames: Record<string, string>;
  onlineUserIds: Set<string>;
  socket: Socket | null;
}) {
  const otherIds = useMemo(
    () => conversation.participantIds.filter((id) => id !== meId),
    [conversation.participantIds, meId]
  );
  const title = conversationTitle(conversation, meId, userNames);
  const online = otherIds.some((id) => onlineUserIds.has(id));

  const { data, loading } = useQuery<MessagesData>(MESSAGES_QUERY, {
    variables: { conversationId: conversation.id },
    fetchPolicy: "cache-and-network",
  });

  // Mensagens que chegaram ao vivo (socket) ou foram enviadas por mim.
  const [live, setLive] = useState<ChatMessage[]>([]);
  useEffect(() => setLive([]), [conversation.id]);

  const appendLive = useCallback((message: ChatMessage) => {
    setLive((prev) =>
      prev.some((m) => m.id === message.id) ? prev : [...prev, message]
    );
  }, []);

  // Histórico + ao vivo, deduplicado por id e em ordem cronológica.
  const messages = useMemo(() => {
    const byId = new Map<string, ChatMessage>();
    for (const m of data?.messages ?? []) byId.set(m.id, m);
    for (const m of live) byId.set(m.id, m);
    return [...byId.values()].sort(
      (a, b) =>
        new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
    );
  }, [data, live]);

  // Typing do outro participante.
  const [peerTyping, setPeerTyping] = useState(false);
  const typingTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (!socket) return;

    const onCreated = ({ message }: MessageCreatedPayload) => {
      if (message.conversationId === conversation.id) appendLive(message);
    };
    const onTyping = ({ from }: TypingPayload) => {
      if (!otherIds.includes(from)) return;
      setPeerTyping(true);
      if (typingTimer.current) clearTimeout(typingTimer.current);
      typingTimer.current = setTimeout(() => setPeerTyping(false), 2500);
    };

    socket.on("message_created", onCreated);
    socket.on("typing", onTyping);
    return () => {
      socket.off("message_created", onCreated);
      socket.off("typing", onTyping);
    };
  }, [socket, conversation.id, otherIds, appendLive]);

  // Auto-scroll para a última mensagem.
  const bottomRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages.length, peerTyping]);

  // Emite "typing" para os outros participantes (throttle simples).
  const lastTypingSent = useRef(0);
  const emitTyping = useCallback(() => {
    if (!socket) return;
    const now = Date.now();
    if (now - lastTypingSent.current < 1200) return;
    lastTypingSent.current = now;
    for (const id of otherIds) socket.emit("typing", { to: id });
  }, [socket, otherIds]);

  return (
    <div className="flex h-full flex-col bg-surface">
      <header className="flex items-center gap-3 border-b border-hairline bg-panel px-4 py-3">
        <Avatar name={title} seed={otherIds[0] ?? conversation.id} />
        <div className="min-w-0">
          <h2 className="truncate text-sm font-semibold text-bubble-fg">
            {title}
          </h2>
          <p className="flex items-center gap-1.5 font-mono text-[11px] text-muted">
            {peerTyping ? (
              <>
                <TypingDots />
                <span className="text-live">digitando…</span>
              </>
            ) : online ? (
              <>
                <span className="dot-live h-2 w-2 rounded-full bg-live" />
                online
              </>
            ) : (
              <>
                <span className="h-2 w-2 rounded-full bg-muted/40" />
                offline
              </>
            )}
          </p>
        </div>
      </header>

      <div className="flex-1 space-y-2 overflow-y-auto px-4 py-5">
        {loading && messages.length === 0 ? (
          <p className="pt-10 text-center font-mono text-xs text-muted">
            Carregando mensagens…
          </p>
        ) : messages.length === 0 ? (
          <p className="pt-10 text-center text-sm text-muted">
            Nenhuma mensagem ainda. Diga olá.
          </p>
        ) : (
          messages.map((message) => (
            <MessageBubble
              key={message.id}
              message={message}
              meId={meId}
              senderName={
                message.senderId
                  ? userNames[message.senderId] ??
                    `Usuário ${message.senderId.slice(0, 6)}`
                  : undefined
              }
            />
          ))
        )}
        <div ref={bottomRef} />
      </div>

      <MessageComposer
        conversationId={conversation.id}
        onTyping={emitTyping}
        onSent={appendLive}
      />
    </div>
  );
}
