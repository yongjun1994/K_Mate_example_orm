import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Tip } from './entities/tip.entity';
import { CreateTipDto } from './dto/create-tip.dto';
import { UpdateTipDto } from './dto/update-tip.dto';

@Injectable()
export class TipsService {
  constructor(
    @InjectRepository(Tip)
    private tipRepository: Repository<Tip>,
  ) {}

  async create(createTipDto: CreateTipDto, authorId: number): Promise<Tip> {
    const tip = this.tipRepository.create({
      ...createTipDto,
      author_id: authorId,
    });

    return await this.tipRepository.save(tip);
  }

  async findAll(): Promise<Tip[]> {
    return await this.tipRepository.find({
      relations: ['author'],
      order: {
        is_pinned: 'DESC',
        created_at: 'DESC',
      },
    });
  }

  async findOne(id: number): Promise<Tip> {
    const tip = await this.tipRepository.findOne({
      where: { id },
      relations: ['author'],
    });

    if (!tip) {
      throw new NotFoundException(`Tip with ID ${id} not found`);
    }

    // 조회수 증가
    await this.tipRepository.increment({ id }, 'view_count', 1);

    return tip;
  }

  async update(id: number, updateTipDto: UpdateTipDto, userId: number, userRole: string): Promise<Tip> {
    const tip = await this.findOne(id);

    // 권한 확인: 관리자이거나 작성자만 수정 가능
    if (userRole !== 'admin' && tip.author_id !== userId) {
      throw new ForbiddenException('You can only update your own tips');
    }

    Object.assign(tip, updateTipDto);
    return await this.tipRepository.save(tip);
  }

  async remove(id: number, userId: number, userRole: string): Promise<void> {
    const tip = await this.findOne(id);

    // 권한 확인: 관리자이거나 작성자만 삭제 가능
    if (userRole !== 'admin' && tip.author_id !== userId) {
      throw new ForbiddenException('You can only delete your own tips');
    }

    await this.tipRepository.remove(tip);
  }

  async findByType(tipType: string): Promise<Tip[]> {
    return await this.tipRepository.find({
      where: { tip_type: tipType as any },
      relations: ['author'],
      order: {
        is_pinned: 'DESC',
        created_at: 'DESC',
      },
    });
  }

  async togglePin(id: number, userRole: string): Promise<Tip> {
    if (userRole !== 'admin') {
      throw new ForbiddenException('Only admins can pin/unpin tips');
    }

    const tip = await this.findOne(id);
    tip.is_pinned = !tip.is_pinned;
    return await this.tipRepository.save(tip);
  }
}
