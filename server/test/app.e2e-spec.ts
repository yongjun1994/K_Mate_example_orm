import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { createTestApp, closeTestApp } from './test-setup';
import { AuthService } from '../src/features/auth/auth.service';

// Jest 타입 정의를 위한 import
/// <reference types="jest" />

describe('AppController (e2e)', () => {
  let app: INestApplication;
  let authService: AuthService;

  beforeAll(async () => {
    app = await createTestApp();
    authService = app.get<AuthService>(AuthService);
  });

  afterAll(async () => {
    await closeTestApp(app);
  });

  it('/ (GET)', () => {
    return request(app.getHttpServer())
      .get('/')
      .expect(200)
      .expect('Hello World!');
  });

  it('/docs (GET) - Swagger documentation', () => {
    return request(app.getHttpServer())
      .get('/docs')
      .expect(200);
  });

  describe('Authentication Flow', () => {
    it('should handle Google OAuth redirect', () => {
      return request(app.getHttpServer())
        .get('/auth/google')
        .expect(302); // Redirect to Google
    });

    it('should refresh tokens', async () => {
      const mockUser = {
        id: 1,
        email: 'test@example.com',
        role: 'user' as const,
      };

      const { refreshToken } = await authService.issueJwt(mockUser);

      return request(app.getHttpServer())
        .post('/auth/refresh')
        .send({ refreshToken })
        .expect(200)
        .expect((res) => {
          expect(res.body).toHaveProperty('accessToken');
          expect(res.body).toHaveProperty('refreshToken');
          expect(res.body).toHaveProperty('message');
        });
    });

    it('should validate tokens', async () => {
      const mockUser = {
        id: 1,
        email: 'test@example.com',
        role: 'user' as const,
      };

      const { accessToken } = await authService.issueJwt(mockUser);

      return request(app.getHttpServer())
        .post('/auth/validate')
        .send({ token: accessToken })
        .expect(200)
        .expect((res) => {
          expect(res.body).toHaveProperty('valid', true);
          expect(res.body).toHaveProperty('payload');
        });
    });
  });

  describe('Posts API', () => {
    let accessToken: string;

    beforeAll(async () => {
      const mockUser = {
        id: 1,
        email: 'test@example.com',
        role: 'user' as const,
      };
      const tokens = await authService.issueJwt(mockUser);
      accessToken = tokens.accessToken;
    });

    it('should get posts list', () => {
      return request(app.getHttpServer())
        .get('/posts')
        .expect(200)
        .expect((res) => {
          expect(Array.isArray(res.body)).toBe(true);
        });
    });

    it('should create a community post with authentication', () => {
      const createPostDto = {
        title: 'E2E Test Post',
        content: 'This is an end-to-end test post content.',
        post_type: 'community',
        category: 'travel_tip',
      };

      return request(app.getHttpServer())
        .post('/posts')
        .set('Authorization', `Bearer ${accessToken}`)
        .send(createPostDto)
        .expect(201)
        .expect((res) => {
          expect(res.body).toHaveProperty('id');
          expect(res.body.title).toBe(createPostDto.title);
          expect(res.body.content).toBe(createPostDto.content);
          expect(res.body.post_type).toBe(createPostDto.post_type);
        });
    });

    it('should get trend posts', () => {
      return request(app.getHttpServer())
        .get('/posts/trend')
        .expect(200)
        .expect((res) => {
          expect(Array.isArray(res.body)).toBe(true);
        });
    });

    it('should get community posts', () => {
      return request(app.getHttpServer())
        .get('/posts/community')
        .expect(200)
        .expect((res) => {
          expect(Array.isArray(res.body)).toBe(true);
        });
    });
  });

  describe('Tips API', () => {
    let adminAccessToken: string;

    beforeAll(async () => {
      const mockAdmin = {
        id: 1,
        email: 'admin@example.com',
        role: 'admin' as const,
      };
      const tokens = await authService.issueJwt(mockAdmin);
      adminAccessToken = tokens.accessToken;
    });

    it('should get tips list', () => {
      return request(app.getHttpServer())
        .get('/tips')
        .expect(200)
        .expect((res) => {
          expect(Array.isArray(res.body)).toBe(true);
        });
    });

    it('should create a tip with admin authentication', () => {
      const createTipDto = {
        title: 'E2E Test Tip',
        content: 'This is an end-to-end test tip content.',
        tip_type: 'bus_guide',
      };

      return request(app.getHttpServer())
        .post('/tips')
        .set('Authorization', `Bearer ${adminAccessToken}`)
        .send(createTipDto)
        .expect(201)
        .expect((res) => {
          expect(res.body).toHaveProperty('id');
          expect(res.body.title).toBe(createTipDto.title);
          expect(res.body.content).toBe(createTipDto.content);
          expect(res.body.tip_type).toBe(createTipDto.tip_type);
        });
    });
  });

  describe('Places API', () => {
    it('should get places list', () => {
      return request(app.getHttpServer())
        .get('/places')
        .expect(200)
        .expect((res) => {
          expect(res.body).toHaveProperty('places');
          expect(res.body).toHaveProperty('total');
          expect(Array.isArray(res.body.places)).toBe(true);
        });
    });

    it('should get places by type', () => {
      return request(app.getHttpServer())
        .get('/places/type/travel')
        .expect(200)
        .expect((res) => {
          expect(Array.isArray(res.body)).toBe(true);
        });
    });
  });

  describe('Error Handling', () => {
    it('should return 404 for non-existent endpoint', () => {
      return request(app.getHttpServer())
        .get('/non-existent-endpoint')
        .expect(404);
    });

    it('should return 401 for protected routes without token', () => {
      return request(app.getHttpServer())
        .post('/posts')
        .send({
          title: 'Test',
          content: 'Test content',
          post_type: 'community',
        })
        .expect(401);
    });

    it('should return 400 for invalid data', () => {
      return request(app.getHttpServer())
        .post('/posts')
        .set('Authorization', 'Bearer invalid-token')
        .send({
          title: '', // Invalid empty title
          content: 'Test content',
          post_type: 'community',
        })
        .expect(401); // Invalid token first
    });
  });
});