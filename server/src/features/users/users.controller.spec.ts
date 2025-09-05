import { Test, TestingModule } from '@nestjs/testing';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';

// Jest 타입 정의를 위한 import
/// <reference types="jest" />

describe('UsersController', () => {
  let controller: UsersController;
  let service: UsersService;

  const mockUser = {
    id: 1,
    google_sub: 'test-google-sub',
    email: 'test@example.com',
    name: 'Test User',
    profile_image_url: 'https://example.com/image.jpg',
    is_active: true,
    created_at: new Date(),
    updated_at: new Date(),
  };

  const mockUsersService = {
    findAll: jest.fn(),
    findById: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [UsersController],
      providers: [
        {
          provide: UsersService,
          useValue: mockUsersService,
        },
      ],
    })
      .overrideGuard(JwtAuthGuard)
      .useValue({ canActivate: () => true })
      .overrideGuard(RolesGuard)
      .useValue({ canActivate: () => true })
      .compile();

    controller = module.get<UsersController>(UsersController);
    service = module.get<UsersService>(UsersService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('findAll', () => {
    it('should return paginated users', async () => {
      const query = {
        page: '1',
        limit: '10',
      };

      const result = {
        users: [mockUser],
        total: 1,
      };

      mockUsersService.findAll.mockResolvedValue(result);

      const response = await controller.findAll(1, 10);

      expect(response).toEqual(result);
      expect(mockUsersService.findAll).toHaveBeenCalledWith(1, 10);
    });

    it('should use default pagination when no query params', async () => {
      const result = {
        users: [mockUser],
        total: 1,
      };

      mockUsersService.findAll.mockResolvedValue(result);

      const response = await controller.findAll();

      expect(response).toEqual(result);
      expect(mockUsersService.findAll).toHaveBeenCalledWith(1, 10);
    });
  });

  describe('findOne', () => {
    it('should return a user by id', async () => {
      mockUsersService.findById.mockResolvedValue(mockUser);

      const result = await controller.findOne('1');

      expect(result).toEqual(mockUser);
      expect(mockUsersService.findById).toHaveBeenCalledWith(1);
    });

    it('should return null when user not found', async () => {
      mockUsersService.findById.mockResolvedValue(null);

      const result = await controller.findOne('999');

      expect(result).toBeNull();
    });
  });

  describe('getProfile', () => {
    it('should return current user profile', async () => {
      const mockRequest = { user: { userId: 1 } };
      mockUsersService.findById.mockResolvedValue(mockUser);

      const result = await controller.getProfile(mockRequest);

      expect(result).toEqual(mockUser);
      expect(mockUsersService.findById).toHaveBeenCalledWith(1);
    });
  });

  describe('updateProfile', () => {
    it('should update current user profile', async () => {
      const mockRequest = { user: { userId: 1 } };
      const updateData = { name: 'Updated User' };
      const updatedUser = { ...mockUser, name: 'Updated User' };
      
      mockUsersService.update.mockResolvedValue(updatedUser);

      const result = await controller.updateProfile(mockRequest, updateData);

      expect(result).toEqual(updatedUser);
      expect(mockUsersService.update).toHaveBeenCalledWith(1, updateData);
    });
  });

  describe('remove', () => {
    it('should remove a user', async () => {
      mockUsersService.delete.mockResolvedValue(undefined);

      await controller.remove('1');

      expect(mockUsersService.delete).toHaveBeenCalledWith(1);
    });
  });
});
