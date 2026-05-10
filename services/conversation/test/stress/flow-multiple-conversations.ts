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

export default function () {
    const conversations: string[] = [];

    for (let i = 1; i <= 3; i++) {
        const createQuery = `
            mutation {
                createConversation(input: {
                    title: "Conversa Paralela ${i}"
                    description: "Descrição ${i}"
                }) {
                    id
                }
            }
        `;

        const res = http.post(
            BASE_URL,
            { query: createQuery },
            {
                headers: { 'Content-Type': 'application/json' },
            },
        );

        try {
            const data = JSON.parse(
                res.body as string,
            ) as CreateConversationData;
            const convId = data.data?.createConversation?.id;
            if (convId) conversations.push(convId);
        } catch {
            return;
        }

        sleep(0.3);
    }

    for (const convId of conversations) {
        const msgQuery = `
            mutation {
                createMessage(input: {
                    conversationId: "${convId}"
                    content: "Teste de stress ${faker.lorem.sentence()}"
                }) {
                    id
                }
            }
        `;

        const res = http.post(
            BASE_URL,
            { query: msgQuery },
            {
                headers: { 'Content-Type': 'application/json' },
            },
        );

        check(res, {
            'Mensagem adicionada em paralelo': (r) => r.status === 200,
        });

        sleep(0.3);
    }

    sleep(1);

    const listQuery = `
        query {
            listConversations {
                id
                title
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
        'Conversas listadas': (r) => r.status === 200,
    });

    sleep(1);

    for (const convId of conversations) {
        const deleteQuery = `
            mutation {
                deleteConversation(id: "${convId}")
            }
        `;

        http.post(
            BASE_URL,
            { query: deleteQuery },
            {
                headers: { 'Content-Type': 'application/json' },
            },
        );

        sleep(0.2);
    }
}
