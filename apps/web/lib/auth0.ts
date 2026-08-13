import { Auth0Client } from "@auth0/nextjs-auth0/server";
import { NextResponse } from "next/server";
import { bffGraphql } from "./bff";

// A query `me` dispara o GetOrProvisionUser no BFF: se o usuário (identificado
// pelo `sub` do Auth0) ainda não existe no user-service, ele é criado. Pedimos
// só o `id` — o efeito colateral (provisionamento) é o que nos interessa.
const PROVISION_USER_QUERY = `query ProvisionUser { me { id } }`;

export const auth0 = new Auth0Client({
  authorizationParameters: {
    audience: process.env.AUTH0_AUDIENCE,
    scope: "openid profile email",
  },
  // Provisiona o usuário no nosso backend a cada login bem-sucedido, em vez de
  // depender de uma visita posterior a /conversations. Best-effort: uma falha
  // no downstream não bloqueia o login (apenas é logada em bffGraphql).
  async onCallback(error, ctx, session) {
    const baseUrl =
      ctx.appBaseUrl ?? process.env.APP_BASE_URL ?? "http://localhost:3000";

    if (error) {
      return NextResponse.redirect(new URL("/auth/login", baseUrl));
    }

    const accessToken = session?.tokenSet?.accessToken;
    if (accessToken) {
      await bffGraphql(accessToken, PROVISION_USER_QUERY);
    }

    return NextResponse.redirect(new URL(ctx.returnTo ?? "/", baseUrl));
  },
});
