import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

interface Profile {
  name?: string;
  email?: string;
}

/**
 * Resolve nome/email do usuário a partir do endpoint Auth0 /userinfo usando o
 * access token. O access token (audience da API) normalmente não carrega claims
 * de perfil, então buscamos aqui de forma confiável (não dá para o cliente
 * forjar — o token é verificado). Cacheado por token com TTL curto para não
 * chamar o Auth0 a cada request.
 */
@Injectable()
export class UserInfoService {
  private readonly logger = new Logger(UserInfoService.name);
  private readonly domain: string;
  private readonly cache = new Map<string, { value: Profile; exp: number }>();
  private readonly ttlMs = 5 * 60 * 1000;

  constructor(config: ConfigService) {
    this.domain = config.getOrThrow<string>('AUTH0_DOMAIN');
  }

  async getProfile(accessToken: string): Promise<Profile> {
    const cached = this.cache.get(accessToken);
    const now = Date.now();
    if (cached && cached.exp > now) return cached.value;

    try {
      const response = await fetch(`https://${this.domain}/userinfo`, {
        headers: { Authorization: `Bearer ${accessToken}` },
      });

      if (!response.ok) {
        this.logger.warn(`/userinfo returned HTTP ${response.status}`);
        return {};
      }

      const data = (await response.json()) as Record<string, unknown>;
      const value: Profile = {
        name: (data.name ?? data.nickname) as string | undefined,
        email: data.email as string | undefined,
      };
      this.cache.set(accessToken, { value, exp: now + this.ttlMs });
      return value;
    } catch (error) {
      this.logger.warn(`Failed to fetch /userinfo: ${String(error)}`);
      return {};
    }
  }
}
