import { Injectable, Inject } from '@nestjs/common';
import { type IFindMessagesByConversationId } from '../ports/output/message.output';
import {
    type ListMessagesByConversationDto,
    type MessageConnectionOutput,
    toMessageConnectionOutput,
} from '../dtos';
import { type ListMessagesByConversationInput as ListMessagesByConversationInputPort } from '../ports/input';

@Injectable()
export class ListMessagesByConversationUseCase implements ListMessagesByConversationInputPort {
    private static readonly DEFAULT_LIMIT = 20;
    private static readonly MAX_LIMIT = 100;

    constructor(
        @Inject('FindMessagesByConversationId')
        private readonly findMessagesByConversationId: IFindMessagesByConversationId,
    ) {}

    async execute(
        input: ListMessagesByConversationDto,
    ): Promise<MessageConnectionOutput> {
        const cursor = input.cursor;
        const limit = input.limit;
        const resolvedLimit = Math.min(
            Math.max(
                limit ?? ListMessagesByConversationUseCase.DEFAULT_LIMIT,
                1,
            ),
            ListMessagesByConversationUseCase.MAX_LIMIT,
        );

        const result =
            await this.findMessagesByConversationId.findByConversationId(
                input.conversationId,
                {
                    cursor,
                    limit: resolvedLimit,
                },
            );

        return toMessageConnectionOutput(result);
    }
}
