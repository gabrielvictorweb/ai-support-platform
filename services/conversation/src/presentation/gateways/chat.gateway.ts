import {
    WebSocketGateway,
    WebSocketServer,
    OnGatewayConnection,
    OnGatewayDisconnect,
    SubscribeMessage,
    ConnectedSocket,
    MessageBody,
} from '@nestjs/websockets';
import { Logger } from '@nestjs/common';
import { Server, Socket } from 'socket.io';
import { type MessageOutput } from '../../application/dtos';

interface ChatHandshakeAuth {
    userId?: string;
}

interface ChatSocketData {
    userId?: string;
}

type ChatSocket = Socket<
    Record<string, never>,
    Record<string, never>,
    Record<string, never>,
    ChatSocketData
>;

@WebSocketGateway({
    cors: true,
})
export class ChatGateway implements OnGatewayConnection, OnGatewayDisconnect {
    private readonly logger = new Logger(ChatGateway.name);

    @WebSocketServer()
    server!: Server;

    private usersSockets = new Map<string, Set<string>>();

    private socketToUser = new Map<string, string>();

    emitMessageCreated(message: MessageOutput): void {
        this.server.emit('message_created', {
            message,
        });

        this.logger.log(`Message emitted via websocket: ${message.id}`);
    }

    handleConnection(client: ChatSocket) {
        const auth = client.handshake.auth as ChatHandshakeAuth;
        const userId = auth.userId ?? client.data.userId;

        if (!userId) {
            this.logger.warn(`Socket ${client.id} disconnected: missing user`);
            client.disconnect();
            return;
        }

        client.data.userId = userId;

        this.socketToUser.set(client.id, userId);

        if (!this.usersSockets.has(userId)) {
            this.usersSockets.set(userId, new Set());
        }

        this.usersSockets.get(userId)!.add(client.id);

        this.server.emit('user_online', { userId });

        this.logger.log(`User online: ${userId}`);
    }

    handleDisconnect(client: ChatSocket) {
        const userId = this.socketToUser.get(client.id);

        if (!userId) return;

        this.socketToUser.delete(client.id);

        const sockets = this.usersSockets.get(userId);

        if (sockets) {
            sockets.delete(client.id);

            if (sockets.size === 0) {
                this.usersSockets.delete(userId);

                this.server.emit('user_offline', { userId });

                this.logger.log(`User offline: ${userId}`);

                // TODO: update last seen
                // await this.usersService.updateLastSeen(userId, new Date());
            }
        }
    }

    @SubscribeMessage('typing')
    handleTyping(
        @ConnectedSocket() client: ChatSocket,
        @MessageBody() data: { to: string },
    ) {
        const fromUser = this.socketToUser.get(client.id);

        const targetSockets = this.usersSockets.get(data.to);

        if (!targetSockets) {
            this.logger.debug(
                `Typing event ignored: target ${data.to} has no active sockets`,
            );
            return;
        }

        targetSockets.forEach((socketId) => {
            this.server.to(socketId).emit('typing', {
                from: fromUser,
            });
        });
    }

    @SubscribeMessage('send_message')
    handleMessage(
        @ConnectedSocket() client: ChatSocket,
        @MessageBody() data: { to: string; message: string },
    ) {
        const fromUser = this.socketToUser.get(client.id);

        const targetSockets = this.usersSockets.get(data.to);

        if (!targetSockets) {
            this.logger.debug(
                `Message event ignored: target ${data.to} has no active sockets`,
            );
            return;
        }

        targetSockets.forEach((socketId) => {
            this.server.to(socketId).emit('receive_message', {
                from: fromUser,
                message: data.message,
            });
        });
    }
}
