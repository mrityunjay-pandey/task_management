import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import type { App } from 'supertest/types';
import { createTestApp } from './utils/create-test-app';

// Requires a real DATABASE_URL (see backend/.env) - unlike the mocked unit
// tests, this genuinely exercises Prisma + Postgres, which is the whole
// point of an e2e/integration test: proving the real pieces work together,
// not just that the logic is correct in isolation.
describe('Auth (e2e)', () => {
  let app: INestApplication<App>;

  beforeAll(async () => {
    app = await createTestApp();
  });

  afterAll(async () => {
    await app.close();
  });

  it('creates a guest session and returns a session cookie', async () => {
    const res = await request(app.getHttpServer()).post('/auth/guest').expect(201);

    expect(res.body.data).toMatchObject({
      guestName: expect.stringMatching(/^Guest-\d{4}$/),
    });
    expect(res.headers['set-cookie']).toBeDefined();
  });

  it('rejects /auth/me with no session cookie', async () => {
    await request(app.getHttpServer()).get('/auth/me').expect(401);
  });

  it('returns the same user on /auth/me using the session cookie from login', async () => {
    const loginRes = await request(app.getHttpServer()).post('/auth/guest').expect(201);
    const cookie = loginRes.headers['set-cookie'];

    const meRes = await request(app.getHttpServer())
      .get('/auth/me')
      .set('Cookie', cookie)
      .expect(200);

    expect(meRes.body.data.id).toBe(loginRes.body.data.id);
  });

  it('rejects a garbage/tampered session cookie', async () => {
    await request(app.getHttpServer())
      .get('/auth/me')
      .set('Cookie', ['session=not-a-real-jwt'])
      .expect(401);
  });

  it('logs out and invalidates the session', async () => {
    const loginRes = await request(app.getHttpServer()).post('/auth/guest').expect(201);
    const loginCookie = loginRes.headers['set-cookie'];

    const logoutRes = await request(app.getHttpServer())
      .post('/auth/logout')
      .set('Cookie', loginCookie)
      .expect(204);

    // logout's Set-Cookie should clear the cookie (empty value / past expiry)
    const clearedCookie = logoutRes.headers['set-cookie'];
    expect(clearedCookie?.[0]).toMatch(/session=;/);
  });
});
