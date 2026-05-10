import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { App } from 'supertest/types';
import { HealthModule } from '../../src/infra/modules/health.module';
import { MetricsModule } from '../../src/infra/modules/metrics.module';

describe('HTTP Controllers (e2e)', () => {
    let app: INestApplication<App>;

    beforeAll(async () => {
        const moduleFixture: TestingModule = await Test.createTestingModule({
            imports: [HealthModule, MetricsModule],
        }).compile();

        app = moduleFixture.createNestApplication();
        await app.init();
    });

    afterAll(async () => {
        await app.close();
    });

    it('/health (GET)', async () => {
        await request(app.getHttpServer()).get('/health').expect(200);
    });

    it('/metrics (GET)', async () => {
        await request(app.getHttpServer())
            .get('/metrics')
            .expect(200)
            .expect((res) => {
                expect(res.text.length).toBeGreaterThan(0);
            });
    });
});
