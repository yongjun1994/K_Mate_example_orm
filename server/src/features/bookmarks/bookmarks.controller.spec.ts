import { Test, TestingModule } from '@nestjs/testing';
import { BookmarksController } from './bookmarks.controller';
import { BookmarksService } from './bookmarks.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';

// Jest 타입 정의를 위한 import
/// <reference types="jest" />

describe('BookmarksController', () => {
  let controller: BookmarksController;
  let service: BookmarksService;

  const mockUser = {
    id: 1,
    email: 'test@example.com',
    name: 'Test User',
  };

  const mockBookmark = {
    id: 1,
    user_id: 1,
    place_id: 1,
    created_at: new Date(),
    place: {
      id: 1,
      name: 'Test Place',
      description: 'Test place description',
    },
  };

  const mockBookmarksService = {
    toggleBookmark: jest.fn(),
    removeBookmark: jest.fn(),
    getUserBookmarks: jest.fn(),
    getBookmarkStatus: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [BookmarksController],
      providers: [
        {
          provide: BookmarksService,
          useValue: mockBookmarksService,
        },
      ],
    })
      .overrideGuard(JwtAuthGuard)
      .useValue({ canActivate: () => true })
      .compile();

    controller = module.get<BookmarksController>(BookmarksController);
    service = module.get<BookmarksService>(BookmarksService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('toggleBookmark', () => {
    it('should create a new bookmark', async () => {
      const toggleResult = { bookmarked: true, bookmark: mockBookmark };
      mockBookmarksService.toggleBookmark.mockResolvedValue(toggleResult);

      const result = await controller.toggleBookmark(1, { user: mockUser });

      expect(result).toEqual({
        message: 'Place bookmarked successfully',
        ...toggleResult,
      });
      expect(mockBookmarksService.toggleBookmark).toHaveBeenCalledWith(1, mockUser.id);
    });

    it('should remove a bookmark', async () => {
      const toggleResult = { bookmarked: false };
      mockBookmarksService.toggleBookmark.mockResolvedValue(toggleResult);

      const result = await controller.toggleBookmark(1, { user: mockUser });

      expect(result).toEqual({
        message: 'Bookmark removed successfully',
        ...toggleResult,
      });
    });
  });

  describe('removeBookmark', () => {
    it('should remove a bookmark', async () => {
      mockBookmarksService.removeBookmark.mockResolvedValue(undefined);

      await controller.removeBookmark(1, { user: mockUser });

      expect(mockBookmarksService.removeBookmark).toHaveBeenCalledWith(1, mockUser.id);
    });
  });

  describe('getMyBookmarks', () => {
    it('should return user bookmarks with pagination', async () => {
      const query = {
        page: '1',
        limit: '10',
      };

      const result = {
        bookmarks: [mockBookmark],
        total: 1,
      };

      mockBookmarksService.getUserBookmarks.mockResolvedValue(result);

      const response = await controller.getMyBookmarks({ user: mockUser }, 1, 10);

      expect(response).toEqual(result);
      expect(mockBookmarksService.getUserBookmarks).toHaveBeenCalledWith(mockUser.id, 1, 10);
    });

    it('should use default pagination when no query params', async () => {
      const result = {
        bookmarks: [mockBookmark],
        total: 1,
      };

      mockBookmarksService.getUserBookmarks.mockResolvedValue(result);

      const response = await controller.getMyBookmarks({ user: mockUser });

      expect(response).toEqual(result);
      expect(mockBookmarksService.getUserBookmarks).toHaveBeenCalledWith(mockUser.id, 1, 10);
    });
  });

  describe('getBookmarkStatus', () => {
    it('should return bookmark status', async () => {
      const status = {
        bookmarked: true,
        bookmark: mockBookmark,
      };

      mockBookmarksService.getBookmarkStatus.mockResolvedValue(status);

      const result = await controller.getBookmarkStatus(1, { user: mockUser });

      expect(result).toEqual(status);
      expect(mockBookmarksService.getBookmarkStatus).toHaveBeenCalledWith(1, mockUser.id);
    });

    it('should return not bookmarked status', async () => {
      const status = {
        bookmarked: false,
        bookmark: undefined,
      };

      mockBookmarksService.getBookmarkStatus.mockResolvedValue(status);

      const result = await controller.getBookmarkStatus(1, { user: mockUser });

      expect(result).toEqual(status);
    });
  });

});
