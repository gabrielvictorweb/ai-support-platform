import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { GqlExecutionContext } from '@nestjs/graphql';
import type { GraphqlContext } from '../../../../presentation/graphql/context/graphql-context.types';

@Injectable()
export class GraphqlAuthGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const gqlContext = GqlExecutionContext.create(context);
    const contextValue = gqlContext.getContext<GraphqlContext>();

    if (!contextValue.user) {
      throw new UnauthorizedException('x-user-id header is required');
    }

    return true;
  }
}
