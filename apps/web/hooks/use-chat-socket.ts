"use client";

import { useEffect, useRef, useState } from "react";
import { io, type Socket } from "socket.io-client";
import type { ChatMessage } from "@/lib/graphql/chat";

export interface MessageCreatedPayload {
  message: ChatMessage;
}

export interface TypingPayload {
  from: string;
}

interface UseChatSocket {
  socket: Socket | null;
  connected: boolean;
  onlineUserIds: Set<string>;
}

/**
 * Conecta ao gateway Socket.IO do conversation-service usando o id interno do
 * usuário no handshake (mesmo contrato do ChatGateway). Mantém o conjunto de
 * usuários online a partir dos eventos user_online/user_offline.
 */
export function useChatSocket(wsUrl: string, meId: string): UseChatSocket {
  const socketRef = useRef<Socket | null>(null);
  const [connected, setConnected] = useState(false);
  const [onlineUserIds, setOnlineUserIds] = useState<Set<string>>(
    () => new Set([meId])
  );

  useEffect(() => {
    if (!wsUrl || !meId) return;

    const socket = io(wsUrl, {
      auth: { userId: meId },
      transports: ["websocket"],
    });
    socketRef.current = socket;

    const onConnect = () => setConnected(true);
    const onDisconnect = () => setConnected(false);
    const onOnline = ({ userId }: { userId: string }) =>
      setOnlineUserIds((prev) => new Set(prev).add(userId));
    const onOffline = ({ userId }: { userId: string }) =>
      setOnlineUserIds((prev) => {
        const next = new Set(prev);
        if (userId !== meId) next.delete(userId);
        return next;
      });

    socket.on("connect", onConnect);
    socket.on("disconnect", onDisconnect);
    socket.on("user_online", onOnline);
    socket.on("user_offline", onOffline);

    return () => {
      socket.off("connect", onConnect);
      socket.off("disconnect", onDisconnect);
      socket.off("user_online", onOnline);
      socket.off("user_offline", onOffline);
      socket.disconnect();
      socketRef.current = null;
    };
  }, [wsUrl, meId]);

  return { socket: socketRef.current, connected, onlineUserIds };
}
