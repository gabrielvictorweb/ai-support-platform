import { Injectable, Inject } from '@nestjs/common';
import { type IFindMessages } from '../ports/output/message.output';
import {
    type ListMessagesDto,
    type MessageConnectionOutput,
    toMessageConnectionOutput,
} from '../dtos';
import { type ListMessagesInput as ListMessagesInputPort } from '../ports/input';

@Injectable()
export class ListMessagesUseCase implements ListMessagesInputPort {
    private static readonly DEFAULT_LIMIT = 20;
    private static readonly MAX_LIMIT = 100;

    constructor(
        @Inject('FindMessages')
        private readonly findMessages: IFindMessages,
    ) {}

    async execute(input?: ListMessagesDto): Promise<MessageConnectionOutput> {
        const cursor = input?.cursor;
        const limit = input?.limit;
        const resolvedLimit = Math.min(
            Math.max(limit ?? ListMessagesUseCase.DEFAULT_LIMIT, 1),
            ListMessagesUseCase.MAX_LIMIT,
        );

        const result = await this.findMessages.findAll({
            cursor,
            limit: resolvedLimit,
        });

        return toMessageConnectionOutput(result);
    }
}
