import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, OneToMany } from 'typeorm';
import { KBuzz } from '../../posts/entities/k-buzz.entity';
import { Tip } from '../../tips/entities/tip.entity';
import { Comment } from '../../comments/entities/comment.entity';
import { Like } from '../../interactions/entities/like.entity';
import { Scrap } from '../../interactions/entities/scrap.entity';
import { Bookmark } from '../../bookmarks/entities/bookmark.entity';

@Entity('users')
export class User {
  @PrimaryGeneratedColumn({ type: 'bigint', unsigned: true })
  id: number;

  @Column({ unique: true })
  email: string;

  @Column()
  name: string;

  @Column({ nullable: true })
  avatar_url: string;

  @Column({ unique: true })
  google_sub: string;

  @Column({ type: 'boolean', default: false })
  email_verified: boolean;

  @Column({ type: 'enum', enum: ['user', 'admin'], default: 'user' })
  role: 'user' | 'admin';

  @CreateDateColumn()
  created_at: Date;

  // Relations
  @OneToMany(() => KBuzz, kBuzz => kBuzz.author)
  k_buzz_posts: KBuzz[];

  @OneToMany(() => Tip, tip => tip.author)
  tips: Tip[];

  @OneToMany(() => Comment, comment => comment.author)
  comments: Comment[];

  @OneToMany(() => Like, like => like.user)
  likes: Like[];

  @OneToMany(() => Scrap, scrap => scrap.user)
  scraps: Scrap[];

  @OneToMany(() => Bookmark, bookmark => bookmark.user)
  bookmarks: Bookmark[];
}
