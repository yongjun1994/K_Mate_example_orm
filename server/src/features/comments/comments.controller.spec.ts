import { Test, TestingModule } from '@nestjs/testing';
import { CommentsController } from './comments.controller';
import { CommentsService } from './comments.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { CreateCommentDto } from './dto/create-comment.dto';
import { UpdateCommentDto } from './dto/update-comment.dto';

// Jest 타입 정의를 위한 import
/// <reference types="jest" />

describe('CommentsController', () => {
  let controller: CommentsController;
  let service: CommentsService;

  const mockUser = {
    id: 1,
    email: 'test@example.com',
    name: 'Test User',
  };

  const mockComment = {
    id: 1,
    content: 'This is a test comment',
    author_id: 1,
    post_type: 'k_buzz',
    post_id: 1,
    created_at: new Date(),
    updated_at: new Date(),
    author: {
      id: 1,
      name: 'Test User',
      email: 'test@example.com',
    },
    k_buzz_post: {
      id: 1,
      title: 'Test K-Buzz Post',
    },
    tip_post: null,
  };

  const mockCommentsService = {
    create: jest.fn(),
    findAll: jest.fn(),
    findOne: jest.fn(),
    update: jest.fn(),
    remove: jest.fn(),
    getUserComments: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [CommentsController],
      providers: [
        {
          provide: CommentsService,
          useValue: mockCommentsService,
        },
      ],
    })
      .overrideGuard(JwtAuthGuard)
      .useValue({ canActivate: () => true })
      .compile();

    controller = module.get<CommentsController>(CommentsController);
    service = module.get<CommentsService>(CommentsService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('create', () => {
    it('should create a new comment', async () => {
      const createCommentDto: CreateCommentDto = {
        content: 'New comment content',
      };

      mockCommentsService.create.mockResolvedValue(mockComment);

      const result = await controller.create('k_buzz', 1, createCommentDto, { user: mockUser });

      expect(result).toEqual(mockComment);
      expect(mockCommentsService.create).toHaveBeenCalledWith(createCommentDto, mockUser.id, 'k_buzz', 1);
    });
  });

  describe('findAll', () => {
    it('should return comments for a post', async () => {
      mockCommentsService.findAll.mockResolvedValue([mockComment]);

      const result = await controller.findAll('k_buzz', 1);

      expect(result).toEqual([mockComment]);
      expect(mockCommentsService.findAll).toHaveBeenCalledWith('k_buzz', 1);
    });
  });

  describe('findOne', () => {
    it('should return a comment by id', async () => {
      mockCommentsService.findOne.mockResolvedValue(mockComment);

      const result = await controller.findOne(1);

      expect(result).toEqual(mockComment);
      expect(mockCommentsService.findOne).toHaveBeenCalledWith(1);
    });

    it('should return null when comment not found', async () => {
      mockCommentsService.findOne.mockResolvedValue(null);

      const result = await controller.findOne(999);

      expect(result).toBeNull();
    });
  });

  describe('update', () => {
    it('should update a comment', async () => {
      const updateCommentDto: UpdateCommentDto = {
        content: 'Updated comment content',
      };

      const updatedComment = { ...mockComment, content: 'Updated comment content' };
      mockCommentsService.update.mockResolvedValue(updatedComment);

      const result = await controller.update(1, updateCommentDto, { user: mockUser });

      expect(result).toEqual(updatedComment);
      expect(mockCommentsService.update).toHaveBeenCalledWith(1, updateCommentDto, mockUser.id);
    });
  });

  describe('remove', () => {
    it('should remove a comment', async () => {
      mockCommentsService.remove.mockResolvedValue(undefined);

      await controller.remove(1, { user: mockUser });

      expect(mockCommentsService.remove).toHaveBeenCalledWith(1, mockUser.id);
    });
  });

  describe('getMyComments', () => {
    it('should return user comments with pagination', async () => {
      const result = {
        comments: [mockComment],
        total: 1,
      };

      mockCommentsService.getUserComments.mockResolvedValue(result);

      const response = await controller.getMyComments({ user: mockUser }, 1, 10);

      expect(response).toEqual(result);
      expect(mockCommentsService.getUserComments).toHaveBeenCalledWith(mockUser.id, 1, 10);
    });

    it('should use default pagination when no query params', async () => {
      const result = {
        comments: [mockComment],
        total: 1,
      };

      mockCommentsService.getUserComments.mockResolvedValue(result);

      const response = await controller.getMyComments({ user: mockUser });

      expect(response).toEqual(result);
      expect(mockCommentsService.getUserComments).toHaveBeenCalledWith(mockUser.id, 1, 10);
    });
  });
});
