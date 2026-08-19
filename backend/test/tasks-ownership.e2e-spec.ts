import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import type { App } from 'supertest/types';
import { createTestApp } from './utils/create-test-app';

// This is the single most important integration test in the app: it
// proves - against a REAL database, with two REAL independent guest
// sessions - that ownership scoping actually works end to end, not just
// that the mocked unit tests believe it does.
describe('Tasks ownership (e2e)', () => {
  let app: INestApplication<App>;
  let userACookie: string[];
  let userBCookie: string[];

  beforeAll(async () => {
    app = await createTestApp();

    const loginA = await request(app.getHttpServer()).post('/auth/guest');
    userACookie = loginA.headers['set-cookie'] as unknown as string[];

    const loginB = await request(app.getHttpServer()).post('/auth/guest');
    userBCookie = loginB.headers['set-cookie'] as unknown as string[];
  });

  afterAll(async () => {
    await app.close();
  });

  it('creates a task for user A', async () => {
    const res = await request(app.getHttpServer())
      .post('/tasks')
      .set('Cookie', userACookie)
      .send({ title: 'User A private task' })
      .expect(201);

    expect(res.body.data.title).toBe('User A private task');
  });

  it("does not include user A's task in user B's task list", async () => {
    const res = await request(app.getHttpServer())
      .get('/tasks')
      .set('Cookie', userBCookie)
      .expect(200);

    const titles = res.body.data.map((t: { title: string }) => t.title);
    expect(titles).not.toContain('User A private task');
  });

  it("returns 404 when user B tries to fetch user A's task directly by id", async () => {
    const createRes = await request(app.getHttpServer())
      .post('/tasks')
      .set('Cookie', userACookie)
      .send({ title: 'Another private task' })
      .expect(201);
    const taskId = createRes.body.data.id;

    await request(app.getHttpServer())
      .get(`/tasks/${taskId}`)
      .set('Cookie', userBCookie)
      .expect(404);

    // Sanity check: the same request succeeds for the actual owner
    await request(app.getHttpServer())
      .get(`/tasks/${taskId}`)
      .set('Cookie', userACookie)
      .expect(200);
  });

  it("returns 404 when user B tries to delete user A's task (and it still exists afterward)", async () => {
    const createRes = await request(app.getHttpServer())
      .post('/tasks')
      .set('Cookie', userACookie)
      .send({ title: 'Task that should survive the attack' })
      .expect(201);
    const taskId = createRes.body.data.id;

    await request(app.getHttpServer())
      .delete(`/tasks/${taskId}`)
      .set('Cookie', userBCookie)
      .expect(404);

    // Prove it wasn't actually deleted despite the attempt
    await request(app.getHttpServer())
      .get(`/tasks/${taskId}`)
      .set('Cookie', userACookie)
      .expect(200);
  });

  it('rejects a task with an empty title (validation)', async () => {
    await request(app.getHttpServer())
      .post('/tasks')
      .set('Cookie', userACookie)
      .send({ title: '' })
      .expect(400);
  });

  it('rejects a request with no session at all', async () => {
    await request(app.getHttpServer()).get('/tasks').expect(401);
  });
});
