import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { GqlExecutionContext } from '@nestjs/graphql';
import type { GraphqlContext } from '../../../../presentation/graphql/context/graphql-context.types';
import { JwtService } from '../../../auth/jwt.service';
import { UserInfoService } from '../../../auth/userinfo.service';

@Injectable()
export class GraphqlAuthGuard implements CanActivate {
  constructor(
    private readonly jwtService: JwtService,
    private readonly userInfoService: UserInfoService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const gqlContext = GqlExecutionContext.create(context);
    const ctx = gqlContext.getContext<GraphqlContext>();

    if (!ctx.token) {
      throw new UnauthorizedException('Bearer token required');
    }

    const { sub, name, email } = await this.jwtService.verify(ctx.token);

    // O access token raramente traz nome/email; busca via /userinfo (confiável e
    // cacheado) para habilitar provisionamento e a allowlist de suporte.
    let resolvedName = name;
    let resolvedEmail = email;
    if (!resolvedEmail || !resolvedName) {
      const profile = await this.userInfoService.getProfile(ctx.token);
      resolvedName = resolvedName ?? profile.name;
      resolvedEmail = resolvedEmail ?? profile.email;
    }

    ctx.user = { userId: sub, name: resolvedName, email: resolvedEmail };

    return true;
  }
}
