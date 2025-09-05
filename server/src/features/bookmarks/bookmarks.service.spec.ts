import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { BookmarksService } from './bookmarks.service';
import { Bookmark } from './entities/bookmark.entity';
import { Place } from '../places/entities/place.entity';
import { User } from '../users/entities/user.entity';

// Jest 타입 정의를 위한 import
/// <reference types="jest" />

describe('BookmarksService', () => {
  let service: BookmarksService;
  let bookmarkRepository: Repository<Bookmark>;
  let placeRepository: Repository<Place>;

  const mockUser: User = {
    id: 1,
    email: 'test@example.com',
    name: 'Test User',
    avatar_url: 'https://example.com/avatar.jpg',
    google_sub: 'test-google-sub',
    email_verified: true,
    role: 'user',
    created_at: new Date(),
    k_buzz_posts: [],
    tips: [],
    comments: [],
    likes: [],
    scraps: [],
    bookmarks: [],
  };

  const mockPlace: Place = {
    id: 1,
    type: 'food',
    name: 'Test Place',
    description: 'Test place description',
    address: '123 Test Street',
    lat: 37.5665,
    lng: 126.9780,
    google_place_id: 'test-google-place-id',
    phone: '02-1234-5678',
    website: 'https://example.com',
    bookmarks: [],
  };

  const mockBookmark: Bookmark = {
    id: 1,
    user_id: 1,
    place_id: 1,
    created_at: new Date(),
    user: mockUser,
    place: mockPlace,
  };

  const mockBookmarkRepository = {
    findOne: jest.fn(),
    create: jest.fn(),
    save: jest.fn(),
    delete: jest.fn(),
    find: jest.fn(),
    findAndCount: jest.fn(),
  };

  const mockPlaceRepository = {
    findOne: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        BookmarksService,
        {
          provide: getRepositoryToken(Bookmark),
          useValue: mockBookmarkRepository,
        },
        {
          provide: getRepositoryToken(Place),
          useValue: mockPlaceRepository,
        },
      ],
    }).compile();

    service = module.get<BookmarksService>(BookmarksService);
    bookmarkRepository = module.get<Repository<Bookmark>>(getRepositoryToken(Bookmark));
    placeRepository = module.get<Repository<Place>>(getRepositoryToken(Place));
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('toggleBookmark', () => {
    it('should create a new bookmark when not exists', async () => {
      mockBookmarkRepository.findOne.mockResolvedValue(null);
      mockPlaceRepository.findOne.mockResolvedValue(mockPlace);
      mockBookmarkRepository.create.mockReturnValue(mockBookmark);
      mockBookmarkRepository.save.mockResolvedValue(mockBookmark);

      const result = await service.toggleBookmark(1, 1);

      expect(result).toEqual({ bookmarked: true, bookmark: mockBookmark });
      expect(mockPlaceRepository.findOne).toHaveBeenCalledWith({ where: { id: 1 } });
      expect(mockBookmarkRepository.create).toHaveBeenCalledWith({
        user_id: 1,
        place_id: 1,
      });
    });

    it('should remove bookmark when exists', async () => {
      mockBookmarkRepository.findOne.mockResolvedValue(mockBookmark);
      mockBookmarkRepository.delete.mockResolvedValue({ affected: 1 });

      const result = await service.toggleBookmark(1, 1);

      expect(result).toEqual({ bookmarked: false });
      expect(mockBookmarkRepository.delete).toHaveBeenCalledWith(mockBookmark.id);
    });

    it('should throw error when post not found', async () => {
      mockBookmarkRepository.findOne.mockResolvedValue(null);
      mockPlaceRepository.findOne.mockResolvedValue(null);

      await expect(service.toggleBookmark(999, 1)).rejects.toThrow('Place not found');
    });
  });

  describe('getUserBookmarks', () => {
    it('should return user bookmarks with pagination', async () => {
      mockBookmarkRepository.findAndCount.mockResolvedValue([[mockBookmark], 1]);

      const result = await service.getUserBookmarks(1, 1, 10);

      expect(result).toEqual({ bookmarks: [mockBookmark], total: 1 });
      expect(mockBookmarkRepository.findAndCount).toHaveBeenCalledWith({
        where: { user_id: 1 },
        relations: ['place'],
        order: { created_at: 'DESC' },
        skip: 0,
        take: 10,
      });
    });
  });

  describe('isBookmarked', () => {
    it('should return true when bookmarked', async () => {
      mockBookmarkRepository.findOne.mockResolvedValue(mockBookmark);

      const result = await service.isBookmarked(1, 1);

      expect(result).toBe(true);
    });

    it('should return false when not bookmarked', async () => {
      mockBookmarkRepository.findOne.mockResolvedValue(null);

      const result = await service.isBookmarked(1, 1);

      expect(result).toBe(false);
    });
  });

  describe('getBookmarkStatus', () => {
    it('should return bookmark status when bookmarked', async () => {
      mockBookmarkRepository.findOne.mockResolvedValue(mockBookmark);

      const result = await service.getBookmarkStatus(1, 1);

      expect(result).toEqual({ bookmarked: true, bookmark: mockBookmark });
    });

    it('should return bookmark status when not bookmarked', async () => {
      mockBookmarkRepository.findOne.mockResolvedValue(null);

      const result = await service.getBookmarkStatus(1, 1);

      expect(result).toEqual({ bookmarked: false, bookmark: undefined });
    });
  });

  describe('removeBookmark', () => {
    it('should remove a bookmark', async () => {
      mockBookmarkRepository.findOne.mockResolvedValue(mockBookmark);
      mockBookmarkRepository.delete.mockResolvedValue({ affected: 1 });

      await service.removeBookmark(1, 1);

      expect(mockBookmarkRepository.findOne).toHaveBeenCalledWith({
        where: { user_id: 1, place_id: 1 },
      });
      expect(mockBookmarkRepository.delete).toHaveBeenCalledWith(mockBookmark.id);
    });

    it('should not throw error when bookmark not found', async () => {
      mockBookmarkRepository.findOne.mockResolvedValue(null);

      await expect(service.removeBookmark(1, 1)).resolves.toBeUndefined();
    });
  });
});
