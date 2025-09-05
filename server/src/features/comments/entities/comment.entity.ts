import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn, Index } from 'typeorm';
import { User } from '../../users/entities/user.entity';
import { KBuzz } from '../../posts/entities/k-buzz.entity';
import { Tip } from '../../tips/entities/tip.entity';

@Entity('comments')
@Index(['post_type', 'post_id'])
@Index(['author_id'])
export class Comment {
  @PrimaryGeneratedColumn({ type: 'bigint', unsigned: true })
  id: number;

  @Column({ type: 'enum', enum: ['k_buzz', 'tips'] })
  post_type: 'k_buzz' | 'tips';

  @Column({ type: 'bigint', unsigned: true })
  post_id: number;

  @Column({ type: 'bigint', unsigned: true })
  author_id: number;

  @Column('text')
  content: string;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;

  // Relations
  @ManyToOne(() => User, user => user.comments)
  @JoinColumn({ name: 'author_id' })
  author: User;

  @ManyToOne(() => KBuzz, kBuzz => kBuzz.comments, { nullable: true })
  @JoinColumn({ name: 'post_id' })
  k_buzz_post: KBuzz;

  @ManyToOne(() => Tip, tip => tip.comments, { nullable: true })
  @JoinColumn({ name: 'post_id' })
  tip_post: Tip;
}
