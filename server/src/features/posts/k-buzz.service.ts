import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { KBuzz } from './entities/k-buzz.entity';
import { CreateKBuzzDto } from './dto/create-k-buzz.dto';
import { UpdateKBuzzDto } from './dto/update-k-buzz.dto';

/**
 * K-Buzz 게시글 서비스
 * 게시글의 CRUD 작업과 비즈니스 로직을 담당
 * TypeORM Repository 패턴을 활용하여 데이터베이스 작업 수행
 */
@Injectable()
export class KBuzzService {
  constructor(
    @InjectRepository(KBuzz)
    private kBuzzRepository: Repository<KBuzz>,
  ) {}

  /**
   * 새로운 K-Buzz 게시글 생성
   * @param createKBuzzDto 게시글 생성 데이터
   * @param authorId 작성자 ID (JWT에서 추출)
   * @returns 생성된 게시글 정보
   */
  async create(createKBuzzDto: CreateKBuzzDto, authorId: number): Promise<KBuzz> {
    // Repository.create()로 엔티티 인스턴스 생성
    const kBuzz = this.kBuzzRepository.create({
      ...createKBuzzDto,
      author_id: authorId, // JWT에서 추출한 사용자 ID 설정
    });

    // 데이터베이스에 저장
    return await this.kBuzzRepository.save(kBuzz);
  }

  /**
   * 모든 게시글 조회 (최신순 정렬)
   * @returns 게시글 목록 (작성자 정보 포함)
   */
  async findAll(): Promise<KBuzz[]> {
    return await this.kBuzzRepository.find({
      relations: ['author'], // 작성자 정보도 함께 조회 (JOIN)
      order: {
        created_at: 'DESC', // 최신 게시글부터 정렬
      },
    });
  }

  /**
   * 트렌드 게시글만 조회
   * 트렌드 랭킹 순으로 정렬하여 반환
   * @returns 트렌드 게시글 목록
   */
  async findTrendPosts(): Promise<KBuzz[]> {
    return await this.kBuzzRepository.find({
      where: { post_type: 'trend' }, // 트렌드 타입만 필터링
      relations: ['author'],
      order: {
        trend_rank: 'ASC',    // 트렌드 랭킹 오름차순 (1위부터)
        created_at: 'DESC',   // 동일 랭킹 시 최신순
      },
    });
  }

  /**
   * 커뮤니티 게시글만 조회
   * 최신순으로 정렬하여 반환
   * @returns 커뮤니티 게시글 목록
   */
  async findCommunityPosts(): Promise<KBuzz[]> {
    return await this.kBuzzRepository.find({
      where: { post_type: 'community' }, // 커뮤니티 타입만 필터링
      relations: ['author'],
      order: {
        created_at: 'DESC', // 최신 게시글부터 정렬
      },
    });
  }

  /**
   * 특정 카테고리의 게시글 조회
   * @param category 조회할 카테고리 (travel_tip, food_review, cafe_review)
   * @returns 해당 카테고리의 게시글 목록
   */
  async findByCategory(category: string): Promise<KBuzz[]> {
    return await this.kBuzzRepository.find({
      where: { category: category as any }, // 타입 캐스팅으로 enum 타입 처리
      relations: ['author'],
      order: {
        created_at: 'DESC', // 최신 게시글부터 정렬
      },
    });
  }

  /**
   * 특정 게시글 상세 조회
   * 조회 시 조회수 자동 증가
   * @param id 게시글 ID
   * @returns 게시글 상세 정보
   * @throws NotFoundException 게시글이 존재하지 않는 경우
   */
  async findOne(id: number): Promise<KBuzz> {
    // 게시글 조회 (작성자 정보 포함)
    const kBuzz = await this.kBuzzRepository.findOne({
      where: { id },
      relations: ['author'],
    });

    // 게시글이 존재하지 않는 경우 예외 발생
    if (!kBuzz) {
      throw new NotFoundException(`K-Buzz post with ID ${id} not found`);
    }

    // 조회수 증가 (원자적 연산으로 동시성 문제 방지)
    await this.kBuzzRepository.increment({ id }, 'view_count', 1);

    return kBuzz;
  }

  /**
   * 게시글 수정
   * 권한 확인 후 게시글 정보 업데이트
   * @param id 게시글 ID
   * @param updateKBuzzDto 수정할 데이터
   * @param userId 요청한 사용자 ID
   * @param userRole 요청한 사용자 역할 (user/admin)
   * @returns 수정된 게시글 정보
   * @throws ForbiddenException 권한이 없는 경우
   */
  async update(id: number, updateKBuzzDto: UpdateKBuzzDto, userId: number, userRole: string): Promise<KBuzz> {
    // 게시글 존재 여부 확인
    const kBuzz = await this.findOne(id);

    // 권한 확인 로직
    if (kBuzz.post_type === 'trend' && userRole !== 'admin') {
      // 트렌드 게시글은 관리자만 수정 가능
      throw new ForbiddenException('Only admins can update trend posts');
    }

    if (kBuzz.post_type === 'community' && userRole !== 'admin' && kBuzz.author_id !== userId) {
      // 커뮤니티 게시글은 작성자 본인 또는 관리자만 수정 가능
      throw new ForbiddenException('You can only update your own community posts');
    }

    // 기존 게시글에 수정 데이터 병합
    Object.assign(kBuzz, updateKBuzzDto);
    
    // 수정된 게시글 저장
    return await this.kBuzzRepository.save(kBuzz);
  }

  /**
   * 게시글 삭제
   * 권한 확인 후 게시글 삭제
   * @param id 게시글 ID
   * @param userId 요청한 사용자 ID
   * @param userRole 요청한 사용자 역할 (user/admin)
   * @throws ForbiddenException 권한이 없는 경우
   */
  async remove(id: number, userId: number, userRole: string): Promise<void> {
    // 게시글 존재 여부 확인
    const kBuzz = await this.findOne(id);

    // 권한 확인 로직
    if (kBuzz.post_type === 'trend' && userRole !== 'admin') {
      // 트렌드 게시글은 관리자만 삭제 가능
      throw new ForbiddenException('Only admins can delete trend posts');
    }

    if (kBuzz.post_type === 'community' && userRole !== 'admin' && kBuzz.author_id !== userId) {
      // 커뮤니티 게시글은 작성자 본인 또는 관리자만 삭제 가능
      throw new ForbiddenException('You can only delete your own community posts');
    }

    // 게시글 삭제
    await this.kBuzzRepository.remove(kBuzz);
  }
}
