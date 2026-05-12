import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { AppModule } from '../src/app.module';

describe('GraphQL Users (e2e)', () => {
  let app: INestApplication;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  afterAll(async () => {
    if (app) {
      await app.close();
    }
  });

  it('returns the current user with conversations and agents', () => {
    return request(app.getHttpServer())
      .post('/graphql')
      .set('x-user-id', 'u1')
      .send({
        query: `
          query {
            me {
              id
              name
              conversations {
                id
                title
                agents {
                  id
                  name
                }
              }
            }
          }
        `,
      })
      .expect(200)
      .expect((response) => {
        expect(response.body.errors).toBeUndefined();
        expect(response.body.data.me).toMatchObject({
          id: 'u1',
          name: 'Ana Silva',
        });
        expect(response.body.data.me.conversations).toHaveLength(2);
        expect(
          response.body.data.me.conversations[0].agents.length,
        ).toBeGreaterThanOrEqual(1);
      });
  });
});
