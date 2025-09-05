import { Entity, PrimaryGeneratedColumn, CreateDateColumn, ManyToOne, JoinColumn, Unique, Column, Index } from 'typeorm';
import { User } from '../../users/entities/user.entity';
import { Place } from '../../places/entities/place.entity';

@Entity('bookmarks')
@Unique(['user_id', 'place_id'])
@Index(['user_id'])
@Index(['place_id'])
export class Bookmark {
  @PrimaryGeneratedColumn({ type: 'bigint', unsigned: true })
  id: number;

  @Column({ type: 'bigint', unsigned: true })
  user_id: number;

  @Column({ type: 'bigint', unsigned: true })
  place_id: number;

  @CreateDateColumn()
  created_at: Date;

  // Relations
  @ManyToOne(() => User, user => user.bookmarks)
  @JoinColumn({ name: 'user_id' })
  user: User;

  @ManyToOne(() => Place, place => place.bookmarks)
  @JoinColumn({ name: 'place_id' })
  place: Place;
}
