import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { GqlExecutionContext } from '@nestjs/graphql';
import type { GraphqlContext } from '../../../../presentation/graphql/context/graphql-context.types';
import { JwtService } from '../../../auth/jwt.service';

@Injectable()
export class GraphqlAuthGuard implements CanActivate {
  constructor(private readonly jwtService: JwtService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const gqlContext = GqlExecutionContext.create(context);
    const ctx = gqlContext.getContext<GraphqlContext>();

    if (!ctx.token) {
      throw new UnauthorizedException('Bearer token required');
    }

    const { sub, name, email } = await this.jwtService.verify(ctx.token);
    ctx.user = { userId: sub, name, email };

    return true;
  }
}
