import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { KBuzz } from './entities/k-buzz.entity';
import { CreateKBuzzDto } from './dto/create-k-buzz.dto';
import { UpdateKBuzzDto } from './dto/update-k-buzz.dto';

@Injectable()
export class KBuzzService {
  constructor(
    @InjectRepository(KBuzz)
    private kBuzzRepository: Repository<KBuzz>,
  ) {}

  async create(createKBuzzDto: CreateKBuzzDto, authorId: number): Promise<KBuzz> {
    const kBuzz = this.kBuzzRepository.create({
      ...createKBuzzDto,
      author_id: authorId,
    });

    return await this.kBuzzRepository.save(kBuzz);
  }

  async findAll(): Promise<KBuzz[]> {
    return await this.kBuzzRepository.find({
      relations: ['author'],
      order: {
        created_at: 'DESC',
      },
    });
  }

  async findTrendPosts(): Promise<KBuzz[]> {
    return await this.kBuzzRepository.find({
      where: { post_type: 'trend' },
      relations: ['author'],
      order: {
        trend_rank: 'ASC',
        created_at: 'DESC',
      },
    });
  }

  async findCommunityPosts(): Promise<KBuzz[]> {
    return await this.kBuzzRepository.find({
      where: { post_type: 'community' },
      relations: ['author'],
      order: {
        created_at: 'DESC',
      },
    });
  }

  async findByCategory(category: string): Promise<KBuzz[]> {
    return await this.kBuzzRepository.find({
      where: { category: category as any },
      relations: ['author'],
      order: {
        created_at: 'DESC',
      },
    });
  }

  async findOne(id: number): Promise<KBuzz> {
    const kBuzz = await this.kBuzzRepository.findOne({
      where: { id },
      relations: ['author'],
    });

    if (!kBuzz) {
      throw new NotFoundException(`K-Buzz post with ID ${id} not found`);
    }

    // 조회수 증가
    await this.kBuzzRepository.increment({ id }, 'view_count', 1);

    return kBuzz;
  }

  async update(id: number, updateKBuzzDto: UpdateKBuzzDto, userId: number, userRole: string): Promise<KBuzz> {
    const kBuzz = await this.findOne(id);

    // 권한 확인
    if (kBuzz.post_type === 'trend' && userRole !== 'admin') {
      throw new ForbiddenException('Only admins can update trend posts');
    }

    if (kBuzz.post_type === 'community' && userRole !== 'admin' && kBuzz.author_id !== userId) {
      throw new ForbiddenException('You can only update your own community posts');
    }

    Object.assign(kBuzz, updateKBuzzDto);
    return await this.kBuzzRepository.save(kBuzz);
  }

  async remove(id: number, userId: number, userRole: string): Promise<void> {
    const kBuzz = await this.findOne(id);

    // 권한 확인
    if (kBuzz.post_type === 'trend' && userRole !== 'admin') {
      throw new ForbiddenException('Only admins can delete trend posts');
    }

    if (kBuzz.post_type === 'community' && userRole !== 'admin' && kBuzz.author_id !== userId) {
      throw new ForbiddenException('You can only delete your own community posts');
    }

    await this.kBuzzRepository.remove(kBuzz);
  }
}
