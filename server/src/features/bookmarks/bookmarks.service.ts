import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Bookmark } from './entities/bookmark.entity';
import { Place } from '../places/entities/place.entity';

@Injectable()
export class BookmarksService {
  constructor(
    @InjectRepository(Bookmark)
    private readonly bookmarkRepository: Repository<Bookmark>,
    @InjectRepository(Place)
    private readonly placeRepository: Repository<Place>,
  ) {}

  async toggleBookmark(placeId: number, userId: number): Promise<{ bookmarked: boolean; bookmark?: Bookmark }> {
    // 기존 북마크 확인
    const existingBookmark = await this.bookmarkRepository.findOne({
      where: { place_id: placeId, user_id: userId },
    });

    if (existingBookmark) {
      // 북마크가 있으면 제거
      await this.bookmarkRepository.delete(existingBookmark.id);
      return { bookmarked: false };
    } else {
      // 북마크가 없으면 추가
      const place = await this.placeRepository.findOne({ where: { id: placeId } });
      if (!place) {
        throw new NotFoundException('Place not found');
      }

      const bookmark = this.bookmarkRepository.create({
        place_id: placeId,
        user_id: userId,
      });

      const savedBookmark = await this.bookmarkRepository.save(bookmark);
      return { bookmarked: true, bookmark: savedBookmark };
    }
  }

  async getUserBookmarks(userId: number, page: number = 1, limit: number = 10): Promise<{ bookmarks: Bookmark[]; total: number }> {
    const [bookmarks, total] = await this.bookmarkRepository.findAndCount({
      where: { user_id: userId },
      relations: ['place'],
      order: { created_at: 'DESC' },
      skip: (page - 1) * limit,
      take: limit,
    });

    return { bookmarks, total };
  }

  async isBookmarked(placeId: number, userId: number): Promise<boolean> {
    const bookmark = await this.bookmarkRepository.findOne({
      where: { place_id: placeId, user_id: userId },
    });

    return !!bookmark;
  }

  async getBookmarkStatus(placeId: number, userId: number): Promise<{ bookmarked: boolean; bookmark?: Bookmark }> {
    const bookmark = await this.bookmarkRepository.findOne({
      where: { place_id: placeId, user_id: userId },
    });

    return { bookmarked: !!bookmark, bookmark: bookmark || undefined };
  }

  async removeBookmark(placeId: number, userId: number): Promise<void> {
    const bookmark = await this.bookmarkRepository.findOne({
      where: { place_id: placeId, user_id: userId },
    });

    if (bookmark) {
      await this.bookmarkRepository.delete(bookmark.id);
    }
  }
}
