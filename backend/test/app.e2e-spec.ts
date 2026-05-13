import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';

describe('AppController (e2e)', () => {
  let app: INestApplication;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.setGlobalPrefix('api');
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  it('/api/health (GET)', () => {
    return request(app.getHttpServer()).get('/api/health').expect(200).expect({ status: 'ok' });
  });

  it('/api/cards/random (GET)', () => {
    return request(app.getHttpServer())
      .get('/api/cards/random')
      .expect(200)
      .expect((res) => {
        expect(res.body).toHaveProperty('id');
        expect(res.body).toHaveProperty('word');
        expect(res.body).toHaveProperty('bannedWords');
        expect(typeof res.body.id).toBe('string');
        expect(typeof res.body.word).toBe('string');
        expect(Array.isArray(res.body.bannedWords)).toBe(true);
        expect(res.body.word.length).toBeGreaterThan(0);
        expect(res.body.bannedWords.length).toBeGreaterThan(0);
      });
  });
});
