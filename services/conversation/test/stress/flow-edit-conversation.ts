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
    const initialTitle = `Conv Edição ${faker.lorem.word()}`;

    const createQuery = `
        mutation {
            createConversation(input: {
                title: "${initialTitle}"
                description: "Será atualizada múltiplas vezes"
            }) {
                id
            }
        }
    `;

    const createRes = http.post(
        BASE_URL,
        { query: createQuery },
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

    sleep(1);

    for (let i = 1; i <= 5; i++) {
        const updateQuery = `
            mutation {
                updateConversation(input: {
                    id: "${conversationId}"
                    title: "Título Atualizado ${i}"
                    description: "Descrição atualizada ${i}"
                }) {
                    id
                    title
                    updatedAt
                }
            }
        `;

        const updateRes = http.post(
            BASE_URL,
            { query: updateQuery },
            {
                headers: { 'Content-Type': 'application/json' },
            },
        );

        check(updateRes, {
            'Conversa atualizada': (r) => r.status === 200,
        });

        sleep(0.5);
    }

    sleep(1);

    const getQuery = `
        query {
            getConversation(id: "${conversationId}") {
                id
                title
                description
                updatedAt
            }
        }
    `;

    const getRes = http.post(
        BASE_URL,
        { query: getQuery },
        {
            headers: { 'Content-Type': 'application/json' },
        },
    );

    check(getRes, {
        'Conversa recuperada com sucesso': (r) => r.status === 200,
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
