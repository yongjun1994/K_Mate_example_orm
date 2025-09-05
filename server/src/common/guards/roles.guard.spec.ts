import { Test, TestingModule } from '@nestjs/testing';
import { ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { RolesGuard } from './roles.guard';

// Jest 타입 정의를 위한 import
/// <reference types="jest" />

describe('RolesGuard', () => {
  let guard: RolesGuard;
  let reflector: Reflector;

  const mockReflector = {
    getAllAndOverride: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        RolesGuard,
        {
          provide: Reflector,
          useValue: mockReflector,
        },
      ],
    }).compile();

    guard = module.get<RolesGuard>(RolesGuard);
    reflector = module.get<Reflector>(Reflector);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(guard).toBeDefined();
  });

  describe('canActivate', () => {
    it('should return true when no roles are required', async () => {
      const mockContext = {
        getHandler: jest.fn(),
        getClass: jest.fn(),
      } as unknown as ExecutionContext;

      mockReflector.getAllAndOverride.mockReturnValue(undefined);

      const result = await guard.canActivate(mockContext);

      expect(result).toBe(true);
    });

    it('should return true when user has required role', async () => {
      const mockRequest = {
        user: {
          userId: 1,
          role: 'admin',
        },
      };

      const mockContext = {
        getHandler: jest.fn(),
        getClass: jest.fn(),
        switchToHttp: () => ({
          getRequest: () => mockRequest,
        }),
      } as unknown as ExecutionContext;

      mockReflector.getAllAndOverride.mockReturnValue(['admin']);

      const result = await guard.canActivate(mockContext);

      expect(result).toBe(true);
    });

    it('should return false when user does not have required role', async () => {
      const mockRequest = {
        user: {
          userId: 1,
          role: 'user',
        },
      };

      const mockContext = {
        getHandler: jest.fn(),
        getClass: jest.fn(),
        switchToHttp: () => ({
          getRequest: () => mockRequest,
        }),
      } as unknown as ExecutionContext;

      mockReflector.getAllAndOverride.mockReturnValue(['admin']);

      const result = await guard.canActivate(mockContext);

      expect(result).toBe(false);
    });

    it('should return false when user is not authenticated', async () => {
      const mockRequest = {};

      const mockContext = {
        getHandler: jest.fn(),
        getClass: jest.fn(),
        switchToHttp: () => ({
          getRequest: () => mockRequest,
        }),
      } as unknown as ExecutionContext;

      mockReflector.getAllAndOverride.mockReturnValue(['admin']);

      const result = await guard.canActivate(mockContext);

      expect(result).toBe(false);
    });

    it('should return true when user has one of multiple required roles', async () => {
      const mockRequest = {
        user: {
          userId: 1,
          role: 'moderator',
        },
      };

      const mockContext = {
        getHandler: jest.fn(),
        getClass: jest.fn(),
        switchToHttp: () => ({
          getRequest: () => mockRequest,
        }),
      } as unknown as ExecutionContext;

      mockReflector.getAllAndOverride.mockReturnValue(['admin', 'moderator']);

      const result = await guard.canActivate(mockContext);

      expect(result).toBe(true);
    });

    it('should return false when user role is not in required roles', async () => {
      const mockRequest = {
        user: {
          userId: 1,
          role: 'user',
        },
      };

      const mockContext = {
        getHandler: jest.fn(),
        getClass: jest.fn(),
        switchToHttp: () => ({
          getRequest: () => mockRequest,
        }),
      } as unknown as ExecutionContext;

      mockReflector.getAllAndOverride.mockReturnValue(['admin', 'moderator']);

      const result = await guard.canActivate(mockContext);

      expect(result).toBe(false);
    });
  });
});
