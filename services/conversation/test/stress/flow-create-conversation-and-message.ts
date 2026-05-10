import http from 'k6/http';
import { check, sleep } from 'k6';
import { faker } from '@faker-js/faker';

export const options = {
    stages: [
        { duration: '30s', target: 50 },
        { duration: '1m', target: 100 },
        { duration: '30s', target: 0 },
    ],
    thresholds: {
        http_req_duration: ['p(95)<1000'],
        http_req_failed: ['rate<0.05'],
    },
};

const BASE_URL = 'http://localhost:3000/graphql';

type GraphQLResponse<T> = {
    data?: T;
};

type CreateConversationData = GraphQLResponse<{
    createConversation?: {
        id: string;
    };
}>;

type CreateMessageData = GraphQLResponse<{
    createMessage?: {
        id: string;
    };
}>;

type ListMessagesByConversationData = GraphQLResponse<{
    listMessagesByConversation?: {
        items: {
            id: string;
            content: string;
            createdAt: string;
        }[];
        nextCursor?: string | null;
        hasNextPage: boolean;
    };
}>;

export default function () {
    const conversationTitle = `Conversa ${faker.lorem.word()}`;
    const conversationDesc = faker.lorem.sentence();
    const messageContent = faker.lorem.sentence();

    const createConvQuery = `
        mutation {
            createConversation(input: {
                title: "${conversationTitle}"
                description: "${conversationDesc}"
            }) {
                id
                title
                description
                createdAt
                updatedAt
            }
        }
    `;

    const createRes = http.post(
        BASE_URL,
        { query: createConvQuery },
        {
            headers: { 'Content-Type': 'application/json' },
        },
    );

    let conversationId: string | null = null;
    check(createRes, {
        'Conversa criada': (r) => {
            try {
                const data = JSON.parse(
                    r.body as string,
                ) as CreateConversationData;
                const created = data.data?.createConversation;
                if (!created?.id) {
                    return false;
                }
                conversationId = created.id;
                return r.status === 200;
            } catch {
                return false;
            }
        },
    });

    if (!conversationId) return;

    sleep(1);

    const conversationIdValue = conversationId as string;

    const createMsgQuery = `
        mutation {
            createMessage(input: {
                conversationId: "${conversationIdValue}"
                content: "${messageContent}"
            }) {
                id
                conversationId
                content
                createdAt
                updatedAt
            }
        }
    `;

    const msgRes = http.post(
        BASE_URL,
        { query: createMsgQuery },
        {
            headers: { 'Content-Type': 'application/json' },
        },
    );

    check(msgRes, {
        'Mensagem criada': (r) => {
            try {
                const data = JSON.parse(r.body as string) as CreateMessageData;
                const created = data.data?.createMessage;
                return r.status === 200 && !!created?.id;
            } catch {
                return false;
            }
        },
    });

    sleep(1);

    const listMsgQuery = `
        query {
            listMessagesByConversation(conversationId: "${conversationIdValue}") {
                items {
                    id
                    content
                    createdAt
                }
                nextCursor
                hasNextPage
            }
        }
    `;

    const listRes = http.post(
        BASE_URL,
        { query: listMsgQuery },
        {
            headers: { 'Content-Type': 'application/json' },
        },
    );

    check(listRes, {
        'Mensagens listadas': (r) => {
            try {
                const data = JSON.parse(
                    r.body as string,
                ) as ListMessagesByConversationData;
                const messages =
                    data.data?.listMessagesByConversation?.items ?? [];
                return r.status === 200 && messages.length > 0;
            } catch {
                return false;
            }
        },
    });

    sleep(1);

    const updateConvQuery = `
        mutation {
            updateConversation(input: {
                id: "${conversationIdValue}"
                title: "Conversa Atualizada"
                description: "Descrição atualizada"
            }) {
                id
                title
                description
                updatedAt
            }
        }
    `;

    const updateRes = http.post(
        BASE_URL,
        { query: updateConvQuery },
        {
            headers: { 'Content-Type': 'application/json' },
        },
    );

    check(updateRes, {
        'Conversa atualizada': (r) => r.status === 200,
    });

    sleep(1);

    const deleteConvQuery = `
        mutation {
            deleteConversation(id: "${conversationIdValue}")
        }
    `;

    const deleteRes = http.post(
        BASE_URL,
        { query: deleteConvQuery },
        {
            headers: { 'Content-Type': 'application/json' },
        },
    );

    check(deleteRes, {
        'Conversa deletada': (r) => r.status === 200,
    });
}
