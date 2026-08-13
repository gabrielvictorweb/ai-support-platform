"use client";

import { useEffect, useRef, useState } from "react";
import { useMutation } from "@apollo/client/react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { ASK_AGENT_MUTATION, type AgentAnswer } from "@/lib/graphql/agent";

interface Turn {
  id: string;
  role: "me" | "agent";
  content: string;
  pending?: boolean;
}

interface AskAgentData {
  askAgent: AgentAnswer;
}

export function AgentChat() {
  const [turns, setTurns] = useState<Turn[]>([]);
  const [text, setText] = useState("");
  const [ask, { loading }] = useMutation<AskAgentData>(ASK_AGENT_MUTATION);

  const bottomRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [turns]);

  const submit = async () => {
    const query = text.trim();
    if (!query || loading) return;
    setText("");

    const myId = `me-${Date.now()}`;
    const pendingId = `agent-${Date.now()}`;
    setTurns((prev) => [
      ...prev,
      { id: myId, role: "me", content: query },
      { id: pendingId, role: "agent", content: "…", pending: true },
    ]);

    try {
      const result = await ask({ variables: { query } });
      const answer =
        result.data?.askAgent.answer ?? "Não consegui responder agora.";
      setTurns((prev) =>
        prev.map((turn) =>
          turn.id === pendingId
            ? { ...turn, content: answer, pending: false }
            : turn
        )
      );
    } catch {
      setTurns((prev) =>
        prev.map((turn) =>
          turn.id === pendingId
            ? { ...turn, content: "O assistente está indisponível.", pending: false }
            : turn
        )
      );
    }
  };

  return (
    <div className="flex h-full flex-col bg-surface">
      <header className="flex items-center gap-3 border-b border-hairline bg-panel px-4 py-3">
        <span className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-live/15 font-mono text-xs font-semibold text-live">
          IA
        </span>
        <div>
          <h2 className="text-sm font-semibold text-bubble-fg">Assistente</h2>
          <p className="font-mono text-[11px] text-muted">
            tire dúvidas com a IA
          </p>
        </div>
      </header>

      <div className="flex-1 space-y-2 overflow-y-auto px-4 py-5">
        {turns.length === 0 ? (
          <p className="pt-10 text-center text-sm text-muted">
            Pergunte qualquer coisa para começar.
          </p>
        ) : (
          turns.map((turn) => {
            const mine = turn.role === "me";
            return (
              <div
                key={turn.id}
                className={cn(
                  "flex animate-settle",
                  mine ? "justify-end" : "justify-start"
                )}
              >
                <div
                  className={cn(
                    "max-w-[78%] rounded-2xl px-3.5 py-2 text-sm leading-relaxed shadow-sm",
                    mine
                      ? "rounded-br-sm bg-iris text-white"
                      : "rounded-bl-sm bg-bubble text-bubble-fg",
                    turn.pending && "text-muted"
                  )}
                >
                  {turn.content}
                </div>
              </div>
            );
          })
        )}
        <div ref={bottomRef} />
      </div>

      <form
        className="flex items-center gap-2 border-t border-hairline bg-panel px-4 py-3"
        onSubmit={(event) => {
          event.preventDefault();
          void submit();
        }}
      >
        <Input
          value={text}
          onChange={(event) => setText(event.target.value)}
          placeholder="Pergunte ao assistente"
          aria-label="Pergunta ao assistente"
          autoComplete="off"
        />
        <Button
          type="submit"
          disabled={!text.trim() || loading}
          className="bg-iris text-white hover:bg-iris-strong"
        >
          Perguntar
        </Button>
      </form>
    </div>
  );
}
