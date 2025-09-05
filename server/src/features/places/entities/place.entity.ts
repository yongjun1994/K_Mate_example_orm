import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from 'typeorm';
import { Bookmark } from '../../bookmarks/entities/bookmark.entity';

@Entity('places')
export class Place {
  @PrimaryGeneratedColumn({ type: 'bigint', unsigned: true })
  id: number;

  @Column({ type: 'enum', enum: ['travel', 'food', 'cafe'] })
  type: 'travel' | 'food' | 'cafe';

  @Column()
  name: string;

  @Column({ nullable: true })
  description: string;

  @Column({ nullable: true })
  google_place_id: string;

  @Column({ type: 'decimal', precision: 9, scale: 6 })
  lat: number;

  @Column({ type: 'decimal', precision: 9, scale: 6 })
  lng: number;

  @Column({ nullable: true })
  address: string;

  @Column({ nullable: true })
  phone: string;

  @Column({ nullable: true })
  website: string;

  // Relations
  @OneToMany(() => Bookmark, bookmark => bookmark.place)
  bookmarks: Bookmark[];
}
