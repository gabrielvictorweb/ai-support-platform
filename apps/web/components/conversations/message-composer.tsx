"use client";

import { useState } from "react";
import { useMutation } from "@apollo/client/react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { SEND_MESSAGE_MUTATION, type ChatMessage } from "@/lib/graphql/chat";

interface SendMessageData {
  sendMessage: ChatMessage;
}

export function MessageComposer({
  conversationId,
  onTyping,
  onSent,
}: {
  conversationId: string;
  onTyping: () => void;
  onSent: (message: ChatMessage) => void;
}) {
  const [content, setContent] = useState("");
  const [send, { loading }] = useMutation<SendMessageData>(
    SEND_MESSAGE_MUTATION
  );

  const submit = async () => {
    const text = content.trim();
    if (!text || loading) return;
    setContent("");
    try {
      const result = await send({ variables: { conversationId, content: text } });
      // A mensagem também chega via socket (message_created); o thread deduplica
      // por id, então anexar aqui só garante feedback imediato se o socket cair.
      if (result.data?.sendMessage) onSent(result.data.sendMessage);
    } catch {
      setContent(text); // restaura o texto em caso de falha
    }
  };

  return (
    <form
      className="flex items-center gap-2 border-t border-hairline bg-panel px-4 py-3"
      onSubmit={(event) => {
        event.preventDefault();
        void submit();
      }}
    >
      <Input
        value={content}
        onChange={(event) => {
          setContent(event.target.value);
          onTyping();
        }}
        placeholder="Escreva uma mensagem"
        aria-label="Mensagem"
        autoComplete="off"
      />
      <Button
        type="submit"
        disabled={!content.trim() || loading}
        className="bg-iris text-white hover:bg-iris-strong"
      >
        Enviar
      </Button>
    </form>
  );
}
