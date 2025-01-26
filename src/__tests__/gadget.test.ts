import request from 'supertest';
import { PrismaClient } from '@prisma/client';
import app from '../index';
import { describe, expect, it, beforeAll, beforeEach, afterAll } from '@jest/globals';

const prisma = new PrismaClient();

jest.setTimeout(30000);

describe('Gadget Routes', () => {
  let token: string;
  let gadgetId: string;

  beforeAll(async () => {
    const res = await request(app).post('/auth/register').send({
      email: 'gadget.test@imf.com',
      password: 'secret123',
    });
    token = res.body.token;
  });

  beforeEach(async () => {
    await prisma.gadget.deleteMany();
  });

  afterAll(async () => {
    await prisma.user.deleteMany();
    await prisma.gadget.deleteMany();
    await prisma.$disconnect();
  });

  describe('POST /gadgets', () => {
    it('should create a new gadget', async () => {
      const res = await request(app).post('/gadgets').set('Authorization', `Bearer ${token}`).send({
        name: 'Test Gadget',
      });

      expect(res.status).toBe(201);
      expect(res.body).toHaveProperty('id');
      expect(res.body).toHaveProperty('codename');
      expect(res.body.name).toBe('Test Gadget');
      gadgetId = res.body.id;
    });

    it('should not create a gadget without authentication', async () => {
      const res = await request(app).post('/gadgets').send({
        name: 'Test Gadget',
      });

      expect(res.status).toBe(401);
    });
  });

  describe('GET /gadgets', () => {
    beforeEach(async () => {
      const createRes = await request(app)
        .post('/gadgets')
        .set('Authorization', `Bearer ${token}`)
        .send({
          name: 'Test Gadget',
        });
      gadgetId = createRes.body.id;
    });

    it('should get all gadgets', async () => {
      const res = await request(app).get('/gadgets').set('Authorization', `Bearer ${token}`);

      expect(res.status).toBe(200);
      expect(Array.isArray(res.body)).toBeTruthy();
      expect(res.body[0]).toHaveProperty('missionSuccessProbability');
    });

    it('should filter gadgets by status', async () => {
      const res = await request(app)
        .get('/gadgets?status=AVAILABLE')
        .set('Authorization', `Bearer ${token}`);

      expect(res.status).toBe(200);
      expect(Array.isArray(res.body)).toBeTruthy();
      res.body.forEach((gadget: { status: string }) => {
        expect(gadget.status).toBe('AVAILABLE');
      });
    });
  });

  describe('PATCH /gadgets/:id', () => {
    beforeEach(async () => {
      const createRes = await request(app)
        .post('/gadgets')
        .set('Authorization', `Bearer ${token}`)
        .send({
          name: 'Test Gadget',
        });
      gadgetId = createRes.body.id;
    });

    it('should update a gadget', async () => {
      const res = await request(app)
        .patch(`/gadgets/${gadgetId}`)
        .set('Authorization', `Bearer ${token}`)
        .send({
          name: 'Updated Gadget',
        });

      expect(res.status).toBe(200);
      expect(res.body.name).toBe('Updated Gadget');
    });
  });

  describe('DELETE /gadgets/:id', () => {
    beforeEach(async () => {
      const createRes = await request(app)
        .post('/gadgets')
        .set('Authorization', `Bearer ${token}`)
        .send({
          name: 'Test Gadget',
        });
      gadgetId = createRes.body.id;
    });

    it('should decommission a gadget', async () => {
      const res = await request(app)
        .delete(`/gadgets/${gadgetId}`)
        .set('Authorization', `Bearer ${token}`);

      expect(res.status).toBe(200);
      expect(res.body.status).toBe('DECOMMISSIONED');
      expect(res.body.decommissionedAt).toBeTruthy();
    });
  });

  describe('POST /gadgets/:id/self-destruct', () => {
    beforeEach(async () => {
      const createRes = await request(app)
        .post('/gadgets')
        .set('Authorization', `Bearer ${token}`)
        .send({
          name: 'Test Gadget',
        });
      gadgetId = createRes.body.id;
    });

    it('should trigger self-destruct with valid confirmation code', async () => {
      const selfDestructRes = await request(app)
        .post(`/gadgets/${gadgetId}/self-destruct`)
        .set('Authorization', `Bearer ${token}`)
        .send({});

      const confirmationCode = selfDestructRes.body.expectedCode;

      const res = await request(app)
        .post(`/gadgets/${gadgetId}/self-destruct`)
        .set('Authorization', `Bearer ${token}`)
        .send({
          confirmationCode,
        });

      expect(res.status).toBe(200);
      expect(res.body.gadget.status).toBe('DESTROYED');
    });
  });
});
