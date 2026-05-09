import { MessageConnectionOutput } from 'src/application/dtos';
import { MessagePresenter } from './message.presenter';

export class MessageConnectionPresenter {
    static toGrpcResponse(message: MessageConnectionOutput) {
        return {
            items: message.items.map(
                (item) => MessagePresenter.toGrpcResponse(item).message,
            ),
            nextCursor: message.nextCursor ?? '',
            hasNextPage: message.hasNextPage,
        };
    }
}
