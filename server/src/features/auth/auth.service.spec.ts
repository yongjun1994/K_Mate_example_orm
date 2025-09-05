import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { JwtService } from '@nestjs/jwt';
import { Repository } from 'typeorm';
import { AuthService } from './auth.service';
import { User } from '../users/entities/user.entity';

// Jest 타입 정의를 위한 import
/// <reference types="jest" />

describe('AuthService', () => {
  let service: AuthService;
  let userRepository: Repository<User>;
  let jwtService: JwtService;

  const mockUser: User = {
    id: 1,
    google_sub: 'test-google-sub',
    email: 'test@example.com',
    name: 'Test User',
    profile_image_url: 'https://example.com/image.jpg',
    is_active: true,
    created_at: new Date(),
    updated_at: new Date(),
    posts: [],
    comments: [],
    interactions: [],
    bookmarks: [],
  };

  const mockUserRepository = {
    findOne: jest.fn(),
    create: jest.fn(),
    save: jest.fn(),
  };

  const mockJwtService = {
    signAsync: jest.fn(),
    verifyAsync: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        {
          provide: getRepositoryToken(User),
          useValue: mockUserRepository,
        },
        {
          provide: JwtService,
          useValue: mockJwtService,
        },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
    userRepository = module.get<Repository<User>>(getRepositoryToken(User));
    jwtService = module.get<JwtService>(JwtService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('upsertUser', () => {
    it('should create new user when not exists', async () => {
      const googleUser = {
        google_sub: 'new-google-sub',
        email: 'new@example.com',
        name: 'New User',
        avatar_url: 'https://example.com/new-image.jpg',
        email_verified: true,
      };

      mockUserRepository.findOne.mockResolvedValue(null);
      mockUserRepository.create.mockReturnValue(mockUser);
      mockUserRepository.save.mockResolvedValue(mockUser);

      const result = await service.upsertUser(googleUser);

      expect(result).toEqual(mockUser);
      expect(mockUserRepository.findOne).toHaveBeenCalledWith({
        where: { google_sub: googleUser.google_sub },
      });
      expect(mockUserRepository.create).toHaveBeenCalledWith({
        google_sub: googleUser.google_sub,
        email: googleUser.email,
        name: googleUser.name,
        avatar_url: googleUser.avatar_url,
        email_verified: googleUser.email_verified,
        role: 'user',
      });
    });

    it('should update existing user', async () => {
      const googleUser = {
        google_sub: 'test-google-sub',
        email: 'updated@example.com',
        name: 'Updated User',
        avatar_url: 'https://example.com/updated-image.jpg',
        email_verified: true,
      };

      const updatedUser = { ...mockUser, name: 'Updated User' };
      mockUserRepository.findOne.mockResolvedValue(mockUser);
      mockUserRepository.save.mockResolvedValue(updatedUser);

      const result = await service.upsertUser(googleUser);

      expect(result).toEqual(updatedUser);
      expect(mockUserRepository.save).toHaveBeenCalledWith({
        ...mockUser,
        email: googleUser.email,
        name: googleUser.name,
        avatar_url: googleUser.avatar_url,
        email_verified: googleUser.email_verified,
      });
    });
  });

  describe('issueJwt', () => {
    it('should return access and refresh tokens for valid user', async () => {
      const accessToken = 'test-access-token';
      const refreshToken = 'test-refresh-token';
      const user = {
        id: 1,
        email: 'test@example.com',
        role: 'user' as const,
      };

      mockJwtService.signAsync
        .mockResolvedValueOnce(accessToken)
        .mockResolvedValueOnce(refreshToken);

      const result = await service.issueJwt(user);

      expect(result).toEqual({ accessToken, refreshToken });
      expect(mockJwtService.signAsync).toHaveBeenCalledTimes(2);
    });
  });

  describe('refreshToken', () => {
    it('should refresh tokens with valid refresh token', async () => {
      const refreshToken = 'valid-refresh-token';
      const payload = { sub: 1, email: 'test@example.com', role: 'user' };
      const user = {
        id: 1,
        email: 'test@example.com',
        role: 'user' as const,
      };

      mockJwtService.verifyAsync.mockResolvedValue(payload);
      mockUserRepository.findOne.mockResolvedValue(user);
      mockJwtService.signAsync
        .mockResolvedValueOnce('new-access-token')
        .mockResolvedValueOnce('new-refresh-token');

      const result = await service.refreshToken(refreshToken);

      expect(mockJwtService.verifyAsync).toHaveBeenCalledWith(refreshToken, {
        secret: process.env.JWT_REFRESH_SECRET,
      });
      expect(mockUserRepository.findOne).toHaveBeenCalledWith({
        where: { id: 1 },
      });
      expect(result).toEqual({
        accessToken: 'new-access-token',
        refreshToken: 'new-refresh-token',
      });
    });

    it('should throw error for invalid refresh token', async () => {
      const refreshToken = 'invalid-refresh-token';

      mockJwtService.verifyAsync.mockRejectedValue(new Error('Invalid token'));

      await expect(service.refreshToken(refreshToken)).rejects.toThrow('Invalid refresh token');
    });

    it('should throw error when user not found', async () => {
      const refreshToken = 'valid-refresh-token';
      const payload = { sub: 999, email: 'test@example.com', role: 'user' };

      mockJwtService.verifyAsync.mockResolvedValue(payload);
      mockUserRepository.findOne.mockResolvedValue(null);

      await expect(service.refreshToken(refreshToken)).rejects.toThrow('Invalid refresh token');
    });
  });

  describe('validateToken', () => {
    it('should return payload for valid token', async () => {
      const token = 'valid-token';
      const payload = { sub: 1, email: 'test@example.com', role: 'user' };

      mockJwtService.verifyAsync.mockResolvedValue(payload);

      const result = await service.validateToken(token);

      expect(mockJwtService.verifyAsync).toHaveBeenCalledWith(token, {
        secret: process.env.JWT_SECRET,
      });
      expect(result).toEqual(payload);
    });

    it('should return null for invalid token', async () => {
      const token = 'invalid-token';

      mockJwtService.verifyAsync.mockRejectedValue(new Error('Invalid token'));

      const result = await service.validateToken(token);

      expect(result).toBeNull();
    });
  });
});
