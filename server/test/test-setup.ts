import { Test, TestingModule } from '@nestjs/testing';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule } from '@nestjs/config';
import { INestApplication } from '@nestjs/common';
import { ValidationPipe } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

// Entities
import { User } from '../src/features/users/entities/user.entity';
import { KBuzz } from '../src/features/posts/entities/k-buzz.entity';
import { Comment } from '../src/features/comments/entities/comment.entity';
import { Like } from '../src/features/interactions/entities/like.entity';
import { Scrap } from '../src/features/interactions/entities/scrap.entity';
import { Place } from '../src/features/places/entities/place.entity';
import { Bookmark } from '../src/features/bookmarks/entities/bookmark.entity';
import { Tip } from '../src/features/tips/entities/tip.entity';

export async function createTestApp(): Promise<INestApplication> {
  const moduleFixture: TestingModule = await Test.createTestingModule({
    imports: [
      ConfigModule.forRoot({
        isGlobal: true,
        envFilePath: 'test/test.env',
      }),
      TypeOrmModule.forRoot({
        type: 'mysql',
        host: process.env.DB_HOST || 'localhost',
        port: parseInt(process.env.DB_PORT) || 3306,
        username: process.env.DB_USERNAME || 'root',
        password: process.env.DB_PASSWORD || 'password',
        database: process.env.DB_DATABASE || 'k_mate_test',
        entities: [User, KBuzz, Comment, Like, Scrap, Place, Bookmark, Tip],
        synchronize: true,
        logging: false,
        dropSchema: true, // 테스트 시 스키마를 매번 새로 생성
      }),
      TypeOrmModule.forFeature([User, KBuzz, Comment, Like, Scrap, Place, Bookmark, Tip]),
    ],
  }).compile();

  const app = moduleFixture.createNestApplication();
  
  app.useGlobalPipes(new ValidationPipe({ 
    whitelist: true, 
    transform: true 
  }));

  app.enableCors({
    origin: ["http://localhost:5173", "http://127.0.0.1:5173"],
    credentials: true,
  });

  // Swagger 설정 (테스트용)
  const config = new DocumentBuilder()
    .setTitle("K-Mate API Test")
    .setDescription("K-Mate Backend API Test Docs")
    .setVersion("1.0.0")
    .addBearerAuth()
    .build();

  const doc = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup("/docs", app, doc);

  await app.init();
  return app;
}

export async function closeTestApp(app: INestApplication): Promise<void> {
  await app.close();
}
