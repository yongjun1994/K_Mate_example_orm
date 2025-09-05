import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, OneToMany, JoinColumn, Index } from 'typeorm';
import { User } from '../../users/entities/user.entity';
import { Comment } from '../../comments/entities/comment.entity';
import { Like } from '../../interactions/entities/like.entity';
import { Scrap } from '../../interactions/entities/scrap.entity';

@Entity('k_buzz')
@Index(['post_type'])
@Index(['trend_week', 'trend_rank'])
@Index(['category'])
@Index(['author_id'])
export class KBuzz {
  @PrimaryGeneratedColumn({ type: 'bigint', unsigned: true })
  id: number;

  @Column()
  title: string;

  @Column('longtext')
  content: string;

  @Column({ type: 'enum', enum: ['trend', 'community'] })
  post_type: 'trend' | 'community';

  @Column({ type: 'enum', enum: ['travel_tip', 'food_review', 'cafe_review'], nullable: true })
  category: 'travel_tip' | 'food_review' | 'cafe_review';

  @Column({ nullable: true })
  trend_week: number;

  @Column({ nullable: true })
  trend_rank: number;

  @Column({ default: 0 })
  view_count: number;

  @Column({ default: 0 })
  scrap_count: number;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;

  // Relations
  @ManyToOne(() => User, user => user.k_buzz_posts)
  @JoinColumn({ name: 'author_id' })
  author: User;

  @Column({ type: 'bigint', unsigned: true })
  author_id: number;

  @OneToMany(() => Comment, comment => comment.k_buzz_post)
  comments: Comment[];

  @OneToMany(() => Like, like => like.k_buzz_post)
  likes: Like[];

  @OneToMany(() => Scrap, scrap => scrap.k_buzz_post)
  scraps: Scrap[];
}
