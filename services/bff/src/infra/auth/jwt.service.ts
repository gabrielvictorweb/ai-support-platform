import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { createRemoteJWKSet, jwtVerify } from 'jose';

@Injectable()
export class JwtService {
  private readonly jwks: ReturnType<typeof createRemoteJWKSet>;
  private readonly audience: string;
  private readonly issuer: string;

  constructor(private readonly config: ConfigService) {
    const domain = this.config.getOrThrow<string>('AUTH0_DOMAIN');
    this.audience = this.config.getOrThrow<string>('AUTH0_AUDIENCE');
    this.issuer = `https://${domain}/`;
    this.jwks = createRemoteJWKSet(
      new URL(`https://${domain}/.well-known/jwks.json`),
    );
  }

  async verify(
    token: string,
  ): Promise<{ sub: string; name?: string; email?: string }> {
    try {
      const { payload } = await jwtVerify(token, this.jwks, {
        audience: this.audience,
        issuer: this.issuer,
      });

      if (!payload.sub) {
        throw new UnauthorizedException('Token missing sub claim');
      }

      return {
        sub: payload.sub,
        name: payload['name'] as string | undefined,
        email: payload['email'] as string | undefined,
      };
    } catch (error) {
      if (error instanceof UnauthorizedException) throw error;
      throw new UnauthorizedException('Invalid or expired token');
    }
  }
}
