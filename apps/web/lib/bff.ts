// Executes a GraphQL query against the BFF using the Auth0 access token (server-side only).
export async function bffGraphql<T>(
  accessToken: string,
  query: string,
  variables?: Record<string, unknown>,
): Promise<T | null> {
  try {
    const response = await fetch(process.env.BFF_GRAPHQL_URL!, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${accessToken}`,
      },
      body: JSON.stringify({ query, variables }),
      cache: "no-store",
    });

    if (!response.ok) {
      console.error(
        `[bffGraphql] HTTP ${response.status} ${response.statusText} from BFF`,
      );
      return null;
    }

    const { data, errors } = await response.json();

    // Erros GraphQL retornam HTTP 200 com um array `errors`; antes eram
    // descartados silenciosamente, mascarando falhas (ex.: provisionamento).
    if (errors?.length) {
      console.error("[bffGraphql] GraphQL errors:", JSON.stringify(errors));
    }

    return (data as T) ?? null;
  } catch (error) {
    console.error("[bffGraphql] request failed:", error);
    return null;
  }
}
