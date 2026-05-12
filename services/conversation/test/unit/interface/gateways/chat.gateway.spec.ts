import { ChatGateway } from '../../../../src/presentation/gateways/chat.gateway';
import { MessageOutput } from '../../../../src/application/dtos';

describe('ChatGateway', () => {
    it('should emit message created event', () => {
        const gateway = new ChatGateway();
        const emit = jest.fn();
        (gateway as any).server = { emit };

        const message: MessageOutput = {
            id: 'msg-1',
            conversationId: 'conv-1',
            content: 'hello',
            createdAt: new Date(),
            updatedAt: new Date(),
        };

        const log = jest.spyOn((gateway as any).logger, 'log');

        gateway.emitMessageCreated(message);

        expect(emit).toHaveBeenCalledWith('message_created', { message });
        expect(log).toHaveBeenCalledWith(
            'Message emitted via websocket: msg-1',
        );
    });

    it('should disconnect when userId is missing', () => {
        const gateway = new ChatGateway();
        const client = {
            id: 'socket-1',
            handshake: { auth: {} },
            data: {},
            disconnect: jest.fn(),
        };

        const warn = jest.spyOn((gateway as any).logger, 'warn');

        gateway.handleConnection(client as any);

        expect(client.disconnect).toHaveBeenCalled();
        expect(warn).toHaveBeenCalledWith(
            'Socket socket-1 disconnected: missing user',
        );
    });

    it('should register user and emit online event', () => {
        const gateway = new ChatGateway();
        const emit = jest.fn();
        (gateway as any).server = { emit };

        const client = {
            id: 'socket-1',
            handshake: { auth: { userId: 'user-1' } },
            data: {},
            disconnect: jest.fn(),
        };

        const log = jest.spyOn((gateway as any).logger, 'log');

        gateway.handleConnection(client as any);

        expect((gateway as any).socketToUser.get('socket-1')).toBe('user-1');
        expect(
            (gateway as any).usersSockets.get('user-1')?.has('socket-1'),
        ).toBe(true);
        expect(emit).toHaveBeenCalledWith('user_online', { userId: 'user-1' });
        expect(log).toHaveBeenCalledWith('User online: user-1');
    });

    it('should use userId from socket data when auth is missing', () => {
        const gateway = new ChatGateway();
        const emit = jest.fn();
        (gateway as any).server = { emit };

        const client = {
            id: 'socket-2',
            handshake: { auth: {} },
            data: { userId: 'user-2' },
            disconnect: jest.fn(),
        };

        gateway.handleConnection(client as any);

        expect((gateway as any).socketToUser.get('socket-2')).toBe('user-2');
        expect(
            (gateway as any).usersSockets.get('user-2')?.has('socket-2'),
        ).toBe(true);
        expect(emit).toHaveBeenCalledWith('user_online', { userId: 'user-2' });
    });

    it('should add socket to existing user set', () => {
        const gateway = new ChatGateway();
        const emit = jest.fn();
        (gateway as any).server = { emit };

        (gateway as any).usersSockets.set('user-1', new Set(['socket-1']));

        const client = {
            id: 'socket-3',
            handshake: { auth: { userId: 'user-1' } },
            data: {},
            disconnect: jest.fn(),
        };

        gateway.handleConnection(client as any);

        expect(
            (gateway as any).usersSockets.get('user-1')?.has('socket-3'),
        ).toBe(true);
    });

    it('should emit offline when last socket disconnects', () => {
        const gateway = new ChatGateway();
        const emit = jest.fn();
        (gateway as any).server = { emit };

        (gateway as any).socketToUser.set('socket-1', 'user-1');
        (gateway as any).usersSockets.set('user-1', new Set(['socket-1']));

        const log = jest.spyOn((gateway as any).logger, 'log');

        gateway.handleDisconnect({ id: 'socket-1' } as any);

        expect((gateway as any).usersSockets.has('user-1')).toBe(false);
        expect(emit).toHaveBeenCalledWith('user_offline', { userId: 'user-1' });
        expect(log).toHaveBeenCalledWith('User offline: user-1');
    });

    it('should ignore disconnect when user is not mapped', () => {
        const gateway = new ChatGateway();
        const emit = jest.fn();
        (gateway as any).server = { emit };

        gateway.handleDisconnect({ id: 'unknown' } as any);

        expect(emit).not.toHaveBeenCalled();
    });

    it('should handle disconnect when sockets set is missing', () => {
        const gateway = new ChatGateway();
        const emit = jest.fn();
        (gateway as any).server = { emit };

        (gateway as any).socketToUser.set('socket-1', 'user-1');

        gateway.handleDisconnect({ id: 'socket-1' } as any);

        expect((gateway as any).socketToUser.has('socket-1')).toBe(false);
        expect(emit).not.toHaveBeenCalled();
    });

    it('should not emit offline when user has other sockets', () => {
        const gateway = new ChatGateway();
        const emit = jest.fn();
        (gateway as any).server = { emit };

        (gateway as any).socketToUser.set('socket-1', 'user-1');
        (gateway as any).socketToUser.set('socket-2', 'user-1');
        (gateway as any).usersSockets.set(
            'user-1',
            new Set(['socket-1', 'socket-2']),
        );

        gateway.handleDisconnect({ id: 'socket-1' } as any);

        expect(
            (gateway as any).usersSockets.get('user-1')?.has('socket-2'),
        ).toBe(true);
        expect(emit).not.toHaveBeenCalledWith('user_offline', {
            userId: 'user-1',
        });
    });

    it('should handle typing event when target has sockets', () => {
        const gateway = new ChatGateway();
        const emit = jest.fn();
        const toEmit = jest.fn();
        (gateway as any).server = {
            emit,
            to: jest.fn(() => ({ emit: toEmit })),
        };

        (gateway as any).socketToUser.set('socket-1', 'user-1');
        (gateway as any).usersSockets.set('user-2', new Set(['socket-2']));

        gateway.handleTyping({ id: 'socket-1' } as any, { to: 'user-2' });

        expect(toEmit).toHaveBeenCalledWith('typing', { from: 'user-1' });
    });

    it('should ignore typing when target has no sockets', () => {
        const gateway = new ChatGateway();
        const toEmit = jest.fn();
        (gateway as any).server = { to: jest.fn(() => ({ emit: toEmit })) };

        const debug = jest.spyOn((gateway as any).logger, 'debug');

        gateway.handleTyping({ id: 'socket-1' } as any, { to: 'missing' });

        expect(toEmit).not.toHaveBeenCalled();
        expect(debug).toHaveBeenCalledWith(
            'Typing event ignored: target missing has no active sockets',
        );
    });

    it('should handle message event when target has sockets', () => {
        const gateway = new ChatGateway();
        const toEmit = jest.fn();
        (gateway as any).server = { to: jest.fn(() => ({ emit: toEmit })) };

        (gateway as any).socketToUser.set('socket-1', 'user-1');
        (gateway as any).usersSockets.set('user-2', new Set(['socket-2']));

        gateway.handleMessage({ id: 'socket-1' } as any, {
            to: 'user-2',
            message: 'hello',
        });

        expect(toEmit).toHaveBeenCalledWith('receive_message', {
            from: 'user-1',
            message: 'hello',
        });
    });

    it('should ignore message when target has no sockets', () => {
        const gateway = new ChatGateway();
        const toEmit = jest.fn();
        (gateway as any).server = { to: jest.fn(() => ({ emit: toEmit })) };

        const debug = jest.spyOn((gateway as any).logger, 'debug');

        gateway.handleMessage({ id: 'socket-1' } as any, {
            to: 'missing',
            message: 'hello',
        });

        expect(toEmit).not.toHaveBeenCalled();
        expect(debug).toHaveBeenCalledWith(
            'Message event ignored: target missing has no active sockets',
        );
    });
});
