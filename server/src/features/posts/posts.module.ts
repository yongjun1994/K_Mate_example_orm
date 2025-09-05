import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { KBuzzController } from './k-buzz.controller';
import { KBuzzService } from './k-buzz.service';
import { KBuzz } from './entities/k-buzz.entity';
import { User } from '../users/entities/user.entity';

/**
 * Posts 모듈
 * K-Buzz 게시글 관련 기능을 담당하는 NestJS 모듈
 * TypeORM을 통한 데이터베이스 연동과 의존성 주입을 설정
 */
@Module({
  imports: [
    // TypeORM Repository 등록
    // KBuzz와 User 엔티티의 Repository를 모듈 내에서 사용 가능하도록 설정
    TypeOrmModule.forFeature([KBuzz, User])
  ],
  controllers: [
    // K-Buzz 게시글 관련 HTTP 요청을 처리하는 컨트롤러
    KBuzzController
  ],
  providers: [
    // K-Buzz 게시글 비즈니스 로직을 담당하는 서비스
    KBuzzService
  ],
  exports: [
    // 다른 모듈에서 KBuzzService를 사용할 수 있도록 export
    // 예: Comments 모듈에서 게시글 정보가 필요할 때 사용
    KBuzzService
  ],
})
export class PostsModule {}
