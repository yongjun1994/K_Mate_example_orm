import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, OneToMany, JoinColumn, Index } from 'typeorm';
import { User } from '../../users/entities/user.entity';
import { Comment } from '../../comments/entities/comment.entity';
import { Like } from '../../interactions/entities/like.entity';
import { Scrap } from '../../interactions/entities/scrap.entity';

/**
 * K-Buzz 게시글 엔티티
 * 한국 여행 정보 공유 플랫폼의 핵심 게시글 기능을 담당
 * 트렌드 게시글과 커뮤니티 게시글을 구분하여 관리
 */
@Entity('k_buzz')
// 성능 최적화를 위한 인덱스 설정
@Index(['post_type'])           // 게시글 타입별 조회 최적화
@Index(['trend_week', 'trend_rank']) // 트렌드 랭킹 조회 최적화
@Index(['category'])            // 카테고리별 조회 최적화
@Index(['author_id'])           // 작성자별 조회 최적화
export class KBuzz {
  /**
   * 게시글 고유 ID
   * bigint 타입으로 대용량 데이터 처리 가능
   * unsigned로 음수 방지
   */
  @PrimaryGeneratedColumn({ type: 'bigint', unsigned: true })
  id: number;

  /**
   * 게시글 제목
   * 필수 입력 필드
   */
  @Column()
  title: string;

  /**
   * 게시글 내용
   * longtext 타입으로 긴 텍스트 저장 가능
   */
  @Column('longtext')
  content: string;

  /**
   * 게시글 타입
   * - trend: 관리자가 작성하는 트렌드 게시글
   * - community: 일반 사용자가 작성하는 커뮤니티 게시글
   */
  @Column({ type: 'enum', enum: ['trend', 'community'] })
  post_type: 'trend' | 'community';

  /**
   * 게시글 카테고리
   * - travel_tip: 여행 팁
   * - food_review: 맛집 리뷰
   * - cafe_review: 카페 리뷰
   * nullable로 설정하여 카테고리 없이도 게시글 작성 가능
   */
  @Column({ type: 'enum', enum: ['travel_tip', 'food_review', 'cafe_review'], nullable: true })
  category: 'travel_tip' | 'food_review' | 'cafe_review';

  /**
   * 트렌드 주차
   * 트렌드 게시글의 경우 몇 주차 트렌드인지 표시
   * nullable로 설정하여 커뮤니티 게시글은 null
   */
  @Column({ nullable: true })
  trend_week: number;

  /**
   * 트렌드 랭킹
   * 해당 주차 내에서의 트렌드 순위
   * nullable로 설정하여 커뮤니티 게시글은 null
   */
  @Column({ nullable: true })
  trend_rank: number;

  /**
   * 조회수
   * 게시글 조회 시마다 자동 증가
   * 기본값 0으로 설정
   */
  @Column({ default: 0 })
  view_count: number;

  /**
   * 스크랩 수
   * 사용자가 게시글을 스크랩할 때마다 증가
   * 기본값 0으로 설정
   */
  @Column({ default: 0 })
  scrap_count: number;

  /**
   * 생성일시
   * 게시글 작성 시 자동으로 현재 시간 저장
   */
  @CreateDateColumn()
  created_at: Date;

  /**
   * 수정일시
   * 게시글 수정 시 자동으로 현재 시간으로 업데이트
   */
  @UpdateDateColumn()
  updated_at: Date;

  // ========== 관계 설정 (Relations) ==========

  /**
   * 게시글 작성자 (다대일 관계)
   * 한 사용자가 여러 게시글을 작성할 수 있음
   * JoinColumn으로 author_id 외래키 설정
   */
  @ManyToOne(() => User, user => user.k_buzz_posts)
  @JoinColumn({ name: 'author_id' })
  author: User;

  /**
   * 작성자 ID (외래키)
   * bigint 타입으로 대용량 사용자 데이터 처리 가능
   * unsigned로 음수 방지
   */
  @Column({ type: 'bigint', unsigned: true })
  author_id: number;

  /**
   * 게시글 댓글 목록 (일대다 관계)
   * 한 게시글에 여러 댓글이 달릴 수 있음
   */
  @OneToMany(() => Comment, comment => comment.k_buzz_post)
  comments: Comment[];

  /**
   * 게시글 좋아요 목록 (일대다 관계)
   * 한 게시글에 여러 사용자가 좋아요를 누를 수 있음
   */
  @OneToMany(() => Like, like => like.k_buzz_post)
  likes: Like[];

  /**
   * 게시글 스크랩 목록 (일대다 관계)
   * 한 게시글을 여러 사용자가 스크랩할 수 있음
   */
  @OneToMany(() => Scrap, scrap => scrap.k_buzz_post)
  scraps: Scrap[];
}
