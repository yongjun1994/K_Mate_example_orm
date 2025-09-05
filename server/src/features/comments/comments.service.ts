import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Comment } from './entities/comment.entity';
import { KBuzz } from '../posts/entities/k-buzz.entity';
import { Tip } from '../tips/entities/tip.entity';

@Injectable()
export class CommentsService {
  constructor(
    @InjectRepository(Comment)
    private readonly commentRepository: Repository<Comment>,
    @InjectRepository(KBuzz)
    private readonly kBuzzRepository: Repository<KBuzz>,
    @InjectRepository(Tip)
    private readonly tipRepository: Repository<Tip>,
  ) {}

  async create(createCommentDto: { content: string }, authorId: number, postType: 'k_buzz' | 'tips', postId: number): Promise<Comment> {
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

    const comment = this.commentRepository.create({
      ...createCommentDto,
      author_id: authorId,
      post_type: postType,
      post_id: postId,
    });

    return await this.commentRepository.save(comment);
  }

  async findAll(postType: 'k_buzz' | 'tips', postId: number): Promise<Comment[]> {
    return this.commentRepository.find({
      where: { post_type: postType, post_id: postId },
      relations: ['author'],
      order: { created_at: 'ASC' },
    });
  }

  async findOne(id: number): Promise<Comment | null> {
    return this.commentRepository.findOne({
      where: { id },
      relations: ['author', 'k_buzz_post', 'tip_post'],
    });
  }

  async update(id: number, updateCommentDto: any, userId: number): Promise<Comment> {
    const comment = await this.commentRepository.findOne({
      where: { id, author_id: userId },
    });

    if (!comment) {
      throw new ForbiddenException('Comment not found or you are not the author');
    }

    Object.assign(comment, updateCommentDto);
    return await this.commentRepository.save(comment);
  }

  async remove(id: number, userId: number): Promise<void> {
    const comment = await this.commentRepository.findOne({
      where: { id, author_id: userId },
    });

    if (!comment) {
      throw new ForbiddenException('Comment not found or you are not the author');
    }

    await this.commentRepository.remove(comment);
  }

  async getUserComments(userId: number, page: number = 1, limit: number = 10): Promise<{ comments: Comment[]; total: number }> {
    const [comments, total] = await this.commentRepository.findAndCount({
      where: { author_id: userId },
      relations: ['author', 'k_buzz_post', 'tip_post'],
      order: { created_at: 'DESC' },
      skip: (page - 1) * limit,
      take: limit,
    });

    return { comments, total };
  }
}
