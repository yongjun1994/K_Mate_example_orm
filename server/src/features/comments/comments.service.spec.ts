import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CommentsService } from './comments.service';
import { Comment } from './entities/comment.entity';
import { KBuzz } from '../posts/entities/k-buzz.entity';
import { Tip } from '../tips/entities/tip.entity';

// Jest 타입 정의를 위한 import
/// <reference types="jest" />

describe('CommentsService', () => {
  let service: CommentsService;
  let commentRepository: Repository<Comment>;
  let kBuzzRepository: Repository<KBuzz>;
  let tipRepository: Repository<Tip>;

  const mockKBuzz: KBuzz = {
    id: 1,
    title: 'Test K-Buzz Post',
    content: 'Test k-buzz post content',
    post_type: 'community',
    category: 'travel_tip',
    view_count: 0,
    scrap_count: 0,
    author_id: 1,
    created_at: new Date(),
    updated_at: new Date(),
    author: null,
    comments: [],
    likes: [],
    scraps: [],
  };

  const mockComment: Comment = {
    id: 1,
    content: 'This is a test comment',
    author_id: 1,
    post_type: 'k_buzz',
    post_id: 1,
    created_at: new Date(),
    updated_at: new Date(),
    author: null,
    k_buzz_post: mockKBuzz,
    tip_post: null,
  };

  const mockCommentRepository = {
    create: jest.fn(),
    save: jest.fn(),
    find: jest.fn(),
    findOne: jest.fn(),
    update: jest.fn(),
    remove: jest.fn(),
    findAndCount: jest.fn(),
  };

  const mockKBuzzRepository = {
    findOne: jest.fn(),
    increment: jest.fn(),
    decrement: jest.fn(),
  };

  const mockTipRepository = {
    findOne: jest.fn(),
    increment: jest.fn(),
    decrement: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CommentsService,
        {
          provide: getRepositoryToken(Comment),
          useValue: mockCommentRepository,
        },
        {
          provide: getRepositoryToken(KBuzz),
          useValue: mockKBuzzRepository,
        },
        {
          provide: getRepositoryToken(Tip),
          useValue: mockTipRepository,
        },
      ],
    }).compile();

    service = module.get<CommentsService>(CommentsService);
    commentRepository = module.get<Repository<Comment>>(getRepositoryToken(Comment));
    kBuzzRepository = module.get<Repository<KBuzz>>(getRepositoryToken(KBuzz));
    tipRepository = module.get<Repository<Tip>>(getRepositoryToken(Tip));
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('should create a new comment', async () => {
      const createCommentDto = {
        content: 'New comment content',
      };

      mockKBuzzRepository.findOne.mockResolvedValue(mockKBuzz);
      mockCommentRepository.create.mockReturnValue(mockComment);
      mockCommentRepository.save.mockResolvedValue(mockComment);
      mockKBuzzRepository.increment.mockResolvedValue({ affected: 1 });
      mockCommentRepository.findOne.mockResolvedValue(mockComment);

      const result = await service.create(createCommentDto, 1, 'k_buzz', 1);

      expect(result).toEqual(mockComment);
      expect(mockKBuzzRepository.findOne).toHaveBeenCalledWith({ where: { id: 1 } });
      expect(mockCommentRepository.create).toHaveBeenCalledWith({
        ...createCommentDto,
        author_id: 1,
        post_type: 'k_buzz',
        post_id: 1,
      });
    });

    it('should throw error when post not found', async () => {
      const createCommentDto = {
        content: 'New comment content',
      };

      mockKBuzzRepository.findOne.mockResolvedValue(null);

      await expect(service.create(createCommentDto, 1, 'k_buzz', 999)).rejects.toThrow('K-Buzz post not found');
    });
  });

  describe('findAll', () => {
    it('should return comments for a post', async () => {
      mockCommentRepository.find.mockResolvedValue([mockComment]);

      const result = await service.findAll('k_buzz', 1);

      expect(result).toEqual([mockComment]);
      expect(mockCommentRepository.find).toHaveBeenCalledWith({
        where: { post_type: 'k_buzz', post_id: 1 },
        relations: ['author'],
        order: { created_at: 'ASC' },
      });
    });
  });

  describe('findOne', () => {
    it('should return a comment', async () => {
      mockCommentRepository.findOne.mockResolvedValue(mockComment);

      const result = await service.findOne(1);

      expect(result).toEqual(mockComment);
      expect(mockCommentRepository.findOne).toHaveBeenCalledWith({
        where: { id: 1 },
        relations: ['author', 'k_buzz_post', 'tip_post'],
      });
    });

    it('should return null when comment not found', async () => {
      mockCommentRepository.findOne.mockResolvedValue(null);

      const result = await service.findOne(999);

      expect(result).toBeNull();
    });
  });

  describe('update', () => {
    it('should update a comment', async () => {
      const updateCommentDto = { content: 'Updated comment' };
      const updatedComment = { ...mockComment, content: 'Updated comment' };

      mockCommentRepository.findOne.mockResolvedValueOnce(mockComment);
      mockCommentRepository.save.mockResolvedValue(updatedComment);

      const result = await service.update(1, updateCommentDto, 1);

      expect(result).toEqual(updatedComment);
      expect(mockCommentRepository.save).toHaveBeenCalledWith(updatedComment);
    });

    it('should throw error when comment not found or user is not author', async () => {
      const updateCommentDto = { content: 'Updated comment' };

      mockCommentRepository.findOne.mockResolvedValue(null);

      await expect(service.update(999, updateCommentDto, 1)).rejects.toThrow('Comment not found or you are not the author');
    });
  });

  describe('remove', () => {
    it('should soft delete a comment and decrement post comment count', async () => {
      mockCommentRepository.findOne.mockResolvedValue(mockComment);
      mockCommentRepository.remove.mockResolvedValue(mockComment);

      await service.remove(1, 1);

      expect(mockCommentRepository.remove).toHaveBeenCalledWith(mockComment);
    });

    it('should throw error when comment not found or user is not author', async () => {
      mockCommentRepository.findOne.mockResolvedValue(null);

      await expect(service.remove(999, 1)).rejects.toThrow('Comment not found or you are not the author');
    });
  });

  describe('getUserComments', () => {
    it('should return user comments with pagination', async () => {
      mockCommentRepository.findAndCount.mockResolvedValue([[mockComment], 1]);

      const result = await service.getUserComments(1, 1, 10);

      expect(result).toEqual({ comments: [mockComment], total: 1 });
      expect(mockCommentRepository.findAndCount).toHaveBeenCalledWith({
        where: { author_id: 1 },
        relations: ['author', 'k_buzz_post', 'tip_post'],
        order: { created_at: 'DESC' },
        skip: 0,
        take: 10,
      });
    });
  });
});
