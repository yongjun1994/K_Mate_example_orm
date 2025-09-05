import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule } from '@nestjs/config';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';
import { AuthService } from '../src/features/auth/auth.service';
import { User } from '../src/features/users/entities/user.entity';

describe('Auth Integration Tests', () => {
  let app: INestApplication;
  let authService: AuthService;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [
        ConfigModule.forRoot({
          isGlobal: true,
          envFilePath: '.env.test',
        }),
        TypeOrmModule.forRoot({
          type: 'sqlite',
          database: ':memory:',
          entities: [User],
          synchronize: true,
        }),
        AppModule,
      ],
    }).compile();

    app = moduleFixture.createNestApplication();
    authService = moduleFixture.get<AuthService>(AuthService);
    
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  describe('POST /auth/refresh', () => {
    it('should refresh tokens with valid refresh token', async () => {
      // Mock user and tokens
      const mockUser = {
        id: 1,
        email: 'test@example.com',
        role: 'user' as const,
      };

      const { accessToken, refreshToken } = await authService.issueJwt(mockUser);

      const response = await request.default(app.getHttpServer())
        .post('/auth/refresh')
        .send({ refreshToken })
        .expect(200);

      expect(response.body).toHaveProperty('accessToken');
      expect(response.body).toHaveProperty('refreshToken');
      expect(response.body).toHaveProperty('message', 'Tokens refreshed successfully');
    });

    it('should return 401 for invalid refresh token', async () => {
      await request.default(app.getHttpServer())
        .post('/auth/refresh')
        .send({ refreshToken: 'invalid-token' })
        .expect(401);
    });
  });

  describe('POST /auth/validate', () => {
    it('should validate valid access token', async () => {
      const mockUser = {
        id: 1,
        email: 'test@example.com',
        role: 'user' as const,
      };

      const { accessToken } = await authService.issueJwt(mockUser);

      const response = await request.default(app.getHttpServer())
        .post('/auth/validate')
        .send({ token: accessToken })
        .expect(200);

      expect(response.body).toHaveProperty('valid', true);
      expect(response.body).toHaveProperty('payload');
    });

    it('should return 401 for invalid access token', async () => {
      await request.default(app.getHttpServer())
        .post('/auth/validate')
        .send({ token: 'invalid-token' })
        .expect(401);
    });
  });
});
