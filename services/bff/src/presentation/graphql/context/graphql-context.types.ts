import DataLoader from 'dataloader';
import { AgentOutput, ConversationOutput } from '../../../application/dtos';

export interface AuthenticatedUser {
  userId: string;
}

export interface GraphqlLoaders {
  conversationsByUserId: DataLoader<string, ConversationOutput[]>;
  agentsByConversationId: DataLoader<string, AgentOutput[]>;
}

export interface GraphqlContext {
  user?: AuthenticatedUser;
  loaders: GraphqlLoaders;
}
