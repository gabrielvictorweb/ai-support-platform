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

type ListMessagesByConversationData = GraphQLResponse<{
    listMessagesByConversation?: {
        items: {
            id: string;
            content: string;
        }[];
        nextCursor?: string | null;
        hasNextPage: boolean;
    };
}>;

export default function () {
    const conversationTitle = `Conversa Multi ${faker.lorem.word()}`;

    const createConvQuery = `
        mutation {
            createConversation(input: {
                title: "${conversationTitle}"
                description: "Conversa com múltiplas mensagens"
            }) {
                id
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
    try {
        const data = JSON.parse(
            createRes.body as string,
        ) as CreateConversationData;
        conversationId = data.data?.createConversation?.id ?? null;
    } catch {
        return;
    }

    if (!conversationId) return;

    const conversationIdValue = conversationId;

    for (let i = 1; i <= 5; i++) {
        const msgQuery = `
            mutation {
                createMessage(input: {
                    conversationId: "${conversationIdValue}"
                    content: "Mensagem número ${i} - ${faker.lorem.sentence()}"
                }) {
                    id
                    content
                }
            }
        `;

        const msgRes = http.post(
            BASE_URL,
            { query: msgQuery },
            {
                headers: { 'Content-Type': 'application/json' },
            },
        );

        check(msgRes, {
            [`Mensagem ${i} criada`]: (r) => r.status === 200,
        });

        sleep(0.5);
    }

    sleep(1);

    const listQuery = `
        query {
            listMessagesByConversation(conversationId: "${conversationIdValue}") {
                items {
                    id
                    content
                }
                nextCursor
                hasNextPage
            }
        }
    `;

    const listRes = http.post(
        BASE_URL,
        { query: listQuery },
        {
            headers: { 'Content-Type': 'application/json' },
        },
    );

    check(listRes, {
        'Todas as 5 mensagens listadas': (r) => {
            try {
                const data = JSON.parse(
                    r.body as string,
                ) as ListMessagesByConversationData;
                const messages =
                    data.data?.listMessagesByConversation?.items ?? [];
                return messages.length === 5;
            } catch {
                return false;
            }
        },
    });

    sleep(1);

    const deleteQuery = `
        mutation {
            deleteConversation(id: "${conversationId}")
        }
    `;

    http.post(
        BASE_URL,
        { query: deleteQuery },
        {
            headers: { 'Content-Type': 'application/json' },
        },
    );
}
