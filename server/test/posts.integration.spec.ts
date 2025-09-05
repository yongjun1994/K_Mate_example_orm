import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule } from '@nestjs/config';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';
import { AuthService } from '../src/features/auth/auth.service';
import { User } from '../src/features/users/entities/user.entity';
import { KBuzz } from '../src/features/posts/entities/k-buzz.entity';
import { Tip } from '../src/features/tips/entities/tip.entity';
import { Place } from '../src/features/places/entities/place.entity';
import { Comment } from '../src/features/comments/entities/comment.entity';
import { Like } from '../src/features/interactions/entities/like.entity';
import { Scrap } from '../src/features/interactions/entities/scrap.entity';
import { Bookmark } from '../src/features/bookmarks/entities/bookmark.entity';

describe('Posts Integration Tests', () => {
  let app: INestApplication;
  let authService: AuthService;
  let accessToken: string;

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
          entities: [User, KBuzz, Tip, Place, Comment, Like, Scrap, Bookmark],
          synchronize: true,
        }),
        AppModule,
      ],
    }).compile();

    app = moduleFixture.createNestApplication();
    authService = moduleFixture.get<AuthService>(AuthService);
    
    // Create test user and get token
    const mockUser = {
      id: 1,
      email: 'test@example.com',
      role: 'user' as const,
    };
    const tokens = await authService.issueJwt(mockUser);
    accessToken = tokens.accessToken;
    
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  describe('GET /posts', () => {
    it('should return posts', async () => {
      const response = await request.default(app.getHttpServer())
        .get('/posts')
        .expect(200);

      expect(Array.isArray(response.body)).toBe(true);
    });

    it('should get trend posts', async () => {
      const response = await request.default(app.getHttpServer())
        .get('/posts/trend')
        .expect(200);

      expect(Array.isArray(response.body)).toBe(true);
    });

    it('should get community posts', async () => {
      const response = await request.default(app.getHttpServer())
        .get('/posts/community')
        .expect(200);

      expect(Array.isArray(response.body)).toBe(true);
    });

    it('should filter posts by category', async () => {
      const response = await request.default(app.getHttpServer())
        .get('/posts/category/travel_tip')
        .expect(200);

      expect(Array.isArray(response.body)).toBe(true);
    });
  });

  describe('POST /posts', () => {
    it('should create a new community post with valid data', async () => {
      const createPostDto = {
        title: 'Test Post Title',
        content: 'This is a test post content for integration testing.',
        post_type: 'community',
        category: 'travel_tip',
      };

      const response = await request.default(app.getHttpServer())
        .post('/posts')
        .set('Authorization', `Bearer ${accessToken}`)
        .send(createPostDto)
        .expect(201);

      expect(response.body).toHaveProperty('id');
      expect(response.body.title).toBe(createPostDto.title);
      expect(response.body.content).toBe(createPostDto.content);
      expect(response.body.post_type).toBe(createPostDto.post_type);
      expect(response.body.category).toBe(createPostDto.category);
    });

    it('should return 400 for invalid post data', async () => {
      const invalidPostDto = {
        title: '', // Empty title should fail validation
        content: 'Short', // Too short content
        post_type: 'community',
      };

      await request.default(app.getHttpServer())
        .post('/posts')
        .set('Authorization', `Bearer ${accessToken}`)
        .send(invalidPostDto)
        .expect(400);
    });

    it('should return 401 without authentication', async () => {
      const createPostDto = {
        title: 'Test Post Title',
        content: 'This is a test post content.',
        post_type: 'community',
        category: 'travel_tip',
      };

      await request.default(app.getHttpServer())
        .post('/posts')
        .send(createPostDto)
        .expect(401);
    });
  });
});