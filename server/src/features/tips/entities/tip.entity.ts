import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, OneToMany, JoinColumn, Index } from 'typeorm';
import { User } from '../../users/entities/user.entity';
import { Comment } from '../../comments/entities/comment.entity';
import { Like } from '../../interactions/entities/like.entity';
import { Scrap } from '../../interactions/entities/scrap.entity';

@Entity('tips')
@Index(['tip_type'])
@Index(['author_id'])
export class Tip {
  @PrimaryGeneratedColumn({ type: 'bigint', unsigned: true })
  id: number;

  @Column()
  title: string;

  @Column('longtext')
  content: string;

  @Column({ type: 'enum', enum: ['bus_guide', 'subway_guide', 'restaurant_book'] })
  tip_type: 'bus_guide' | 'subway_guide' | 'restaurant_book';

  @Column({ default: 0 })
  view_count: number;

  @Column({ default: 0 })
  scrap_count: number;

  @Column({ default: false })
  is_pinned: boolean;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;

  // Relations
  @ManyToOne(() => User, user => user.tips)
  @JoinColumn({ name: 'author_id' })
  author: User;

  @Column({ type: 'bigint', unsigned: true })
  author_id: number;

  @OneToMany(() => Comment, comment => comment.tip_post)
  comments: Comment[];

  @OneToMany(() => Like, like => like.tip_post)
  likes: Like[];

  @OneToMany(() => Scrap, scrap => scrap.tip_post)
  scraps: Scrap[];
}
