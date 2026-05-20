import DataLoader from 'dataloader';
import { AgentOutput, ConversationOutput } from '../../../application/dtos';

export interface AuthenticatedUser {
  userId: string;
  name?: string;
  email?: string;
}

export interface GraphqlLoaders {
  conversationsByUserId: DataLoader<string, ConversationOutput[]>;
  agentsByConversationId: DataLoader<string, AgentOutput[]>;
}

export interface GraphqlContext {
  token?: string;
  user?: AuthenticatedUser;
  loaders: GraphqlLoaders;
}
