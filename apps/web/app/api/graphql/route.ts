import { auth0 } from "@/lib/auth0";
import { NextRequest } from "next/server";

export async function POST(request: NextRequest) {
  const session = await auth0.getSession();
  const accessToken = session?.tokenSet?.accessToken;

  const body = await request.text();

  const response = await fetch(process.env.BFF_GRAPHQL_URL!, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}),
    },
    body,
  });

  const data = await response.json();
  return Response.json(data, { status: response.status });
}
