import { auth0 } from "@/lib/auth0";
import { redirect } from "next/navigation";

const ME_QUERY = `
  query Me {
    me {
      id
      name
    }
  }
`;

interface MeData {
  me: { id: string; name: string };
}

async function fetchMe(accessToken: string): Promise<MeData | null> {
  try {
    const response = await fetch(process.env.BFF_GRAPHQL_URL!, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${accessToken}`,
      },
      body: JSON.stringify({ query: ME_QUERY }),
      cache: "no-store",
    });

    const { data } = await response.json();
    return data ?? null;
  } catch {
    return null;
  }
}

export default async function Home() {
  const session = await auth0.getSession();

  if (!session) {
    redirect("/auth/login");
  }

  const accessToken = session.tokenSet.accessToken;
  const data = accessToken ? await fetchMe(accessToken) : null;

  return (
    <main className="min-h-screen flex items-center justify-center bg-neutral-50">
      <div className="flex flex-col items-center gap-6">
        <h1 className="text-2xl font-semibold text-neutral-900">
          {data?.me?.name
            ? `Welcome, ${data.me.name}`
            : `Welcome, ${session.user.name ?? session.user.email}`}
        </h1>
        <p className="text-sm text-neutral-500">{session.user.email}</p>
        <a
          href="/auth/logout"
          className="text-sm text-neutral-500 underline underline-offset-4 hover:text-neutral-900"
        >
          Sign out
        </a>
      </div>
    </main>
  );
}
