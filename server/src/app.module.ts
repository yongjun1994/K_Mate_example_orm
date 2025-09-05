import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import appConfig from './config/app.config';
import databaseConfig from './config/database.config';

// 각 feature 모듈 import
import { AuthModule } from './features/auth/auth.module';
import { DatabaseModule } from './database/database.module';
import { UsersModule } from './features/users/users.module';
import { PlacesModule } from './features/places/places.module';
import { PostsModule } from './features/posts/posts.module';
import { TipsModule } from './features/tips/tips.module';
import { BookmarksModule } from './features/bookmarks/bookmarks.module';
import { InteractionsModule } from './features/interactions/interactions.module';
import { CommentsModule } from './features/comments/comments.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [appConfig, databaseConfig],
      envFilePath: ['.env', '.env.local', '.env.development'],
    }),
    DatabaseModule,   // ⬅️ 전역 모듈 등록
    AuthModule,
    UsersModule,
    PlacesModule,
    PostsModule,
    TipsModule,
    BookmarksModule,
    InteractionsModule,
    CommentsModule,
  ],
})
export class AppModule {}
