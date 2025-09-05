import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { LikesService } from './likes.service';
import { ScrapsService } from './scraps.service';
import { LikesController } from './likes.controller';
import { ScrapsController } from './scraps.controller';
import { Like } from './entities/like.entity';
import { Scrap } from './entities/scrap.entity';
import { KBuzz } from '../posts/entities/k-buzz.entity';
import { Tip } from '../tips/entities/tip.entity';
import { User } from '../users/entities/user.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Like, Scrap, KBuzz, Tip, User])],
  controllers: [LikesController, ScrapsController],
  providers: [LikesService, ScrapsService],
  exports: [LikesService, ScrapsService],
})
export class InteractionsModule {}
