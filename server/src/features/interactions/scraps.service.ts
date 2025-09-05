import { Injectable, ConflictException, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Scrap } from './entities/scrap.entity';
import { KBuzz } from '../posts/entities/k-buzz.entity';
import { Tip } from '../tips/entities/tip.entity';

@Injectable()
export class ScrapsService {
  constructor(
    @InjectRepository(Scrap)
    private scrapRepository: Repository<Scrap>,
    @InjectRepository(KBuzz)
    private kBuzzRepository: Repository<KBuzz>,
    @InjectRepository(Tip)
    private tipRepository: Repository<Tip>,
  ) {}

  async scrapPost(userId: number, postType: 'k_buzz' | 'tips', postId: number): Promise<Scrap> {
    // 중복 스크랩 확인
    const existingScrap = await this.scrapRepository.findOne({
      where: { user_id: userId, post_type: postType, post_id: postId },
    });

    if (existingScrap) {
      throw new ConflictException('You have already scrapped this post');
    }

    // 게시글 존재 확인 및 스크랩 수 증가
    if (postType === 'k_buzz') {
      const post = await this.kBuzzRepository.findOne({ where: { id: postId } });
      if (!post) {
        throw new NotFoundException('K-Buzz post not found');
      }
      await this.kBuzzRepository.increment({ id: postId }, 'scrap_count', 1);
    } else {
      const post = await this.tipRepository.findOne({ where: { id: postId } });
      if (!post) {
        throw new NotFoundException('Tip post not found');
      }
      await this.tipRepository.increment({ id: postId }, 'scrap_count', 1);
    }

    const scrap = this.scrapRepository.create({
      user_id: userId,
      post_type: postType,
      post_id: postId,
    });

    return await this.scrapRepository.save(scrap);
  }

  async unscrapPost(userId: number, postType: 'k_buzz' | 'tips', postId: number): Promise<void> {
    const scrap = await this.scrapRepository.findOne({
      where: { user_id: userId, post_type: postType, post_id: postId },
    });

    if (!scrap) {
      throw new NotFoundException('Scrap not found');
    }

    // 스크랩 수 감소
    if (postType === 'k_buzz') {
      await this.kBuzzRepository.decrement({ id: postId }, 'scrap_count', 1);
    } else {
      await this.tipRepository.decrement({ id: postId }, 'scrap_count', 1);
    }

    await this.scrapRepository.remove(scrap);
  }

  async getUserScraps(userId: number): Promise<Scrap[]> {
    return await this.scrapRepository.find({
      where: { user_id: userId },
      relations: ['k_buzz_post', 'tip_post'],
    });
  }

  async getPostScraps(postType: 'k_buzz' | 'tips', postId: number): Promise<Scrap[]> {
    return await this.scrapRepository.find({
      where: { post_type: postType, post_id: postId },
      relations: ['user'],
    });
  }

  async isScrapped(userId: number, postType: 'k_buzz' | 'tips', postId: number): Promise<boolean> {
    const scrap = await this.scrapRepository.findOne({
      where: { user_id: userId, post_type: postType, post_id: postId },
    });

    return !!scrap;
  }
}
