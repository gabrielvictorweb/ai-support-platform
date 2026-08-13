import { redirect } from "next/navigation";
import { auth0 } from "@/lib/auth0";
import { bffGraphql } from "@/lib/bff";
import { ChatShell } from "@/components/conversations/chat-shell";
import type { ConversationView } from "@/components/conversations/types";

const ME_QUERY = `
  query Me {
    me {
      id
      name
      role
      conversations {
        id
        participantIds
        createdAt
        updatedAt
      }
    }
  }
`;

const USERS_QUERY = `
  query Users($ids: [ID!]) {
    users(ids: $ids) {
      id
      name
    }
  }
`;

interface MeData {
  me: {
    id: string;
    name: string;
    role: string;
    conversations: ConversationView[];
  };
}

interface UsersData {
  users: { id: string; name: string }[];
}

export default async function ConversationsPage() {
  const session = await auth0.getSession();
  if (!session) redirect("/auth/login");

  const accessToken = session.tokenSet.accessToken;
  if (!accessToken) redirect("/auth/login");

  const meData = await bffGraphql<MeData>(accessToken, ME_QUERY);
  const me = meData?.me;

  if (!me) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-surface px-6 text-center">
        <div>
          <p className="text-sm font-medium text-bubble-fg">
            Não foi possível carregar seu perfil.
          </p>
          <p className="mt-1 font-mono text-xs text-muted">
            Verifique se os serviços (BFF e user-service) estão no ar.
          </p>
        </div>
      </main>
    );
  }

  const conversations = me.conversations ?? [];
  const participantIds = Array.from(
    new Set(conversations.flatMap((conversation) => conversation.participantIds))
  );

  const usersData = participantIds.length
    ? await bffGraphql<UsersData>(accessToken, USERS_QUERY, {
        ids: participantIds,
      })
    : null;

  const userNames: Record<string, string> = { [me.id]: me.name };
  for (const user of usersData?.users ?? []) {
    userNames[user.id] = user.name;
  }

  return (
    <ChatShell
      meId={me.id}
      meName={me.name}
      role={me.role}
      conversations={conversations}
      userNames={userNames}
      wsUrl={process.env.NEXT_PUBLIC_CHAT_WS_URL ?? "http://localhost:3010"}
    />
  );
}
