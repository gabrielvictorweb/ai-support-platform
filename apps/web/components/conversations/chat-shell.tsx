"use client";

import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";
import { useChatSocket } from "@/hooks/use-chat-socket";
import { ConversationList } from "./conversation-list";
import { MessageThread } from "./message-thread";
import { AgentChat } from "./agent-chat";
import type { ConversationView } from "./types";

type Mode = "conversa" | "assistente";

export function ChatShell({
  meId,
  meName,
  role,
  conversations,
  userNames,
  wsUrl,
}: {
  meId: string;
  meName: string;
  role: string;
  conversations: ConversationView[];
  userNames: Record<string, string>;
  wsUrl: string;
}) {
  const { socket, connected, onlineUserIds } = useChatSocket(wsUrl, meId);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [mode, setMode] = useState<Mode>("conversa");

  // O assistente (chat com a IA) é exclusivo de usuários comuns.
  const canUseAssistant = role === "USER";

  // Em telas largas, abre a primeira conversa para não começar vazio.
  useEffect(() => {
    if (activeId || conversations.length === 0) return;
    if (window.matchMedia("(min-width: 768px)").matches) {
      setActiveId(conversations[0].id);
    }
  }, [activeId, conversations]);

  const active = conversations.find((c) => c.id === activeId) ?? null;
  const showRight = mode === "assistente" || !!active;

  const openConversation = (id: string) => {
    setMode("conversa");
    setActiveId(id);
  };

  return (
    <div className="flex h-screen w-full overflow-hidden bg-surface">
      {/* Rail */}
      <aside
        className={cn(
          "h-full w-full flex-col bg-ink md:flex md:w-[340px] md:shrink-0",
          showRight ? "hidden" : "flex"
        )}
      >
        <header className="border-b border-ink-line px-4 py-4">
          <div className="flex items-center justify-between">
            <h1 className="text-sm font-semibold tracking-tight text-neutral-100">
              Atendimento
            </h1>
            <a
              href="/auth/logout"
              className="font-mono text-[11px] text-ink-muted underline-offset-4 hover:text-neutral-200 hover:underline"
            >
              sair
            </a>
          </div>
          <p className="mt-1 flex items-center gap-1.5 font-mono text-[11px] text-ink-muted">
            <span
              className={cn(
                "h-2 w-2 rounded-full",
                connected ? "dot-live bg-live" : "bg-muted/50"
              )}
            />
            {meName}
            <span className="ml-auto rounded bg-ink-soft px-1.5 py-0.5 uppercase tracking-wide">
              {role === "SUPPORT" ? "suporte" : "usuário"}
            </span>
          </p>
        </header>

        {canUseAssistant ? (
          <button
            type="button"
            onClick={() => setMode("assistente")}
            aria-current={mode === "assistente"}
            className={cn(
              "flex items-center gap-3 border-b border-ink-line px-3 py-3 text-left transition-colors",
              mode === "assistente" ? "bg-ink-soft" : "hover:bg-ink-soft/60"
            )}
          >
            <span className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-live/15 font-mono text-[11px] font-semibold text-live">
              IA
            </span>
            <span className="min-w-0">
              <span className="block text-sm font-medium text-neutral-100">
                Assistente
              </span>
              <span className="block font-mono text-[11px] text-ink-muted">
                conversar com a IA
              </span>
            </span>
          </button>
        ) : null}

        <ConversationList
          conversations={conversations}
          activeId={mode === "conversa" ? activeId : null}
          meId={meId}
          userNames={userNames}
          onlineUserIds={onlineUserIds}
          onSelect={openConversation}
        />
      </aside>

      {/* Painel direito */}
      <section
        className={cn(
          "h-full flex-1 flex-col md:flex",
          showRight ? "flex" : "hidden"
        )}
      >
        {mode === "assistente" ? (
          <>
            <button
              type="button"
              onClick={() => setMode("conversa")}
              className="flex items-center gap-1 border-b border-hairline bg-panel px-4 py-2 text-left font-mono text-xs text-muted md:hidden"
            >
              ← Conversas
            </button>
            <div className="min-h-0 flex-1">
              <AgentChat />
            </div>
          </>
        ) : active ? (
          <>
            <button
              type="button"
              onClick={() => setActiveId(null)}
              className="flex items-center gap-1 border-b border-hairline bg-panel px-4 py-2 text-left font-mono text-xs text-muted md:hidden"
            >
              ← Conversas
            </button>
            <div className="min-h-0 flex-1">
              <MessageThread
                key={active.id}
                conversation={active}
                meId={meId}
                userNames={userNames}
                onlineUserIds={onlineUserIds}
                socket={socket}
              />
            </div>
          </>
        ) : (
          <div className="hidden h-full flex-col items-center justify-center gap-2 text-center md:flex">
            <p className="text-sm font-medium text-bubble-fg">
              Selecione uma conversa
            </p>
            <p className="font-mono text-xs text-muted">
              As respostas chegam em tempo real
            </p>
          </div>
        )}
      </section>
    </div>
  );
}
