import { Injectable, ConflictException, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Like } from './entities/like.entity';
import { KBuzz } from '../posts/entities/k-buzz.entity';
import { Tip } from '../tips/entities/tip.entity';

@Injectable()
export class LikesService {
  constructor(
    @InjectRepository(Like)
    private likeRepository: Repository<Like>,
    @InjectRepository(KBuzz)
    private kBuzzRepository: Repository<KBuzz>,
    @InjectRepository(Tip)
    private tipRepository: Repository<Tip>,
  ) {}

  async likePost(userId: number, postType: 'k_buzz' | 'tips', postId: number): Promise<Like> {
    // 중복 좋아요 확인
    const existingLike = await this.likeRepository.findOne({
      where: { user_id: userId, post_type: postType, post_id: postId },
    });

    if (existingLike) {
      throw new ConflictException('You have already liked this post');
    }

    // 게시글 존재 확인
    if (postType === 'k_buzz') {
      const post = await this.kBuzzRepository.findOne({ where: { id: postId } });
      if (!post) {
        throw new NotFoundException('K-Buzz post not found');
      }
    } else {
      const post = await this.tipRepository.findOne({ where: { id: postId } });
      if (!post) {
        throw new NotFoundException('Tip post not found');
      }
    }

    const like = this.likeRepository.create({
      user_id: userId,
      post_type: postType,
      post_id: postId,
    });

    return await this.likeRepository.save(like);
  }

  async unlikePost(userId: number, postType: 'k_buzz' | 'tips', postId: number): Promise<void> {
    const like = await this.likeRepository.findOne({
      where: { user_id: userId, post_type: postType, post_id: postId },
    });

    if (!like) {
      throw new NotFoundException('Like not found');
    }

    await this.likeRepository.remove(like);
  }

  async getUserLikes(userId: number): Promise<Like[]> {
    return await this.likeRepository.find({
      where: { user_id: userId },
      relations: ['k_buzz_post', 'tip_post'],
    });
  }

  async getPostLikes(postType: 'k_buzz' | 'tips', postId: number): Promise<Like[]> {
    return await this.likeRepository.find({
      where: { post_type: postType, post_id: postId },
      relations: ['user'],
    });
  }

  async isLiked(userId: number, postType: 'k_buzz' | 'tips', postId: number): Promise<boolean> {
    const like = await this.likeRepository.findOne({
      where: { user_id: userId, post_type: postType, post_id: postId },
    });

    return !!like;
  }
}
