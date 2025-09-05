import { Entity, PrimaryGeneratedColumn, CreateDateColumn, ManyToOne, JoinColumn, Unique, Column, Index } from 'typeorm';
import { User } from '../../users/entities/user.entity';
import { KBuzz } from '../../posts/entities/k-buzz.entity';
import { Tip } from '../../tips/entities/tip.entity';

@Entity('likes')
@Unique(['user_id', 'post_type', 'post_id'])
@Index(['post_type', 'post_id'])
@Index(['user_id'])
export class Like {
  @PrimaryGeneratedColumn({ type: 'bigint', unsigned: true })
  id: number;

  @Column({ type: 'bigint', unsigned: true })
  user_id: number;

  @Column({ type: 'enum', enum: ['k_buzz', 'tips'] })
  post_type: 'k_buzz' | 'tips';

  @Column({ type: 'bigint', unsigned: true })
  post_id: number;

  @CreateDateColumn()
  created_at: Date;

  // Relations
  @ManyToOne(() => User, user => user.likes)
  @JoinColumn({ name: 'user_id' })
  user: User;

  @ManyToOne(() => KBuzz, kBuzz => kBuzz.likes, { nullable: true })
  @JoinColumn({ name: 'post_id' })
  k_buzz_post: KBuzz;

  @ManyToOne(() => Tip, tip => tip.likes, { nullable: true })
  @JoinColumn({ name: 'post_id' })
  tip_post: Tip;
}
