import { Resolver } from '@nestjs/graphql';
import { ConversationDto } from '../dto/conversation.dto';

@Resolver(() => ConversationDto)
export class ConversationsResolver {}
