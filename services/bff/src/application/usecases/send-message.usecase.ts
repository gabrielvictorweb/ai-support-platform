import { type MessageOutput, type SendMessageDto } from '../dtos';
import { type MessageReadPort } from '../ports/output';

export class SendMessageUseCase {
  constructor(private readonly messageReadPort: MessageReadPort) {}

  execute(input: SendMessageDto): Promise<MessageOutput> {
    return this.messageReadPort.create(input);
  }
}
