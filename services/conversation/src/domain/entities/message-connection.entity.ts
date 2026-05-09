import { Message } from './message.entity';

export class MessageConnection {
    items: Message[];

    nextCursor: string | null;

    hasNextPage: boolean;
}
