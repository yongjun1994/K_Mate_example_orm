import { Test, TestingModule } from '@nestjs/testing';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { Request, Response } from 'express';

// Jest 타입 정의를 위한 import
/// <reference types="jest" />

describe('AuthController', () => {
  let controller: AuthController;
  let service: AuthService;

  const mockUser = {
    id: 1,
    email: 'test@example.com',
    name: 'Test User',
    profile_image_url: 'https://example.com/image.jpg',
  };

  const mockAuthService = {
    upsertUser: jest.fn(),
    issueJwt: jest.fn(),
  };

  const mockRequest = {
    user: mockUser,
  } as Request;

  const mockResponse = {
    redirect: jest.fn(),
    cookie: jest.fn(),
  } as unknown as Response;

  beforeEach(async () => {
    // 환경변수 설정
    process.env.FRONTEND_URL = 'http://localhost:3000';
    
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [
        {
          provide: AuthService,
          useValue: mockAuthService,
        },
      ],
    }).compile();

    controller = module.get<AuthController>(AuthController);
    service = module.get<AuthService>(AuthService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('googleAuth', () => {
    it('should initiate Google OAuth', () => {
      // Google OAuth는 Passport가 처리하므로 단순히 존재하는지만 확인
      expect(controller.googleAuth).toBeDefined();
    });
  });

  describe('googleCallback', () => {
    it('should handle Google OAuth callback and redirect', async () => {
      const googleUser = {
        google_sub: 'test-google-sub',
        email: 'test@example.com',
        name: 'Test User',
        avatar_url: 'https://example.com/image.jpg',
        email_verified: true,
      };

      const appUser = { ...mockUser, ...googleUser };
      const accessToken = 'test-token';

      mockRequest.user = googleUser;
      mockAuthService.upsertUser.mockResolvedValue(appUser);
      mockAuthService.issueJwt.mockResolvedValue({ accessToken });

      await controller.googleCallback(mockRequest, mockResponse);

      expect(mockAuthService.upsertUser).toHaveBeenCalledWith(googleUser);
      expect(mockAuthService.issueJwt).toHaveBeenCalledWith(appUser);
      expect(mockResponse.redirect).toHaveBeenCalledWith(
        expect.stringContaining('access_token=test-token')
      );
    });

    it('should redirect to error page on failure', async () => {
      const googleUser = {
        google_sub: 'test-google-sub',
        email: 'test@example.com',
        name: 'Test User',
        avatar_url: 'https://example.com/image.jpg',
        email_verified: true,
      };

      mockRequest.user = googleUser;
      mockAuthService.upsertUser.mockRejectedValue(new Error('Database error'));

      await controller.googleCallback(mockRequest, mockResponse);

      expect(mockResponse.redirect).toHaveBeenCalledWith(
        expect.stringContaining('/login?error=oauth_failed')
      );
    });
  });
});
