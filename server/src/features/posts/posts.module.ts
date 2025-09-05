import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { KBuzzController } from './k-buzz.controller';
import { KBuzzService } from './k-buzz.service';
import { KBuzz } from './entities/k-buzz.entity';
import { User } from '../users/entities/user.entity';

@Module({
  imports: [TypeOrmModule.forFeature([KBuzz, User])],
  controllers: [KBuzzController],
  providers: [KBuzzService],
  exports: [KBuzzService],
})
export class PostsModule {}
