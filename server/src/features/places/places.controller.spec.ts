import { Test, TestingModule } from '@nestjs/testing';
import { PlacesController } from './places.controller';
import { PlacesService } from './places.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { CreatePlaceDto } from './dto/create-place.dto';
import { UpdatePlaceDto } from './dto/update-place.dto';

// Jest 타입 정의를 위한 import
/// <reference types="jest" />

describe('PlacesController', () => {
  let controller: PlacesController;
  let service: PlacesService;

  const mockUser = {
    id: 1,
    email: 'admin@example.com',
    name: 'Admin User',
    role: 'admin',
  };

  const mockPlace = {
    id: 1,
    name: 'Test Place',
    description: 'This is a test place',
    address: '123 Test Street, Test City',
    type: 'food',
    lat: 37.5665,
    lng: 126.9780,
    google_place_id: 'test-google-place-id',
    phone: '02-1234-5678',
    website: 'https://example.com',
    bookmarks: [],
  };

  const mockPlacesService = {
    create: jest.fn(),
    findAll: jest.fn(),
    findOne: jest.fn(),
    update: jest.fn(),
    remove: jest.fn(),
    getPlacesByType: jest.fn(),
    searchPlacesNearby: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [PlacesController],
      providers: [
        {
          provide: PlacesService,
          useValue: mockPlacesService,
        },
      ],
    })
      .overrideGuard(JwtAuthGuard)
      .useValue({ canActivate: () => true })
      .overrideGuard(RolesGuard)
      .useValue({ canActivate: () => true })
      .compile();

    controller = module.get<PlacesController>(PlacesController);
    service = module.get<PlacesService>(PlacesService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('create', () => {
    it('should create a new place', async () => {
      const createPlaceDto: CreatePlaceDto = {
        name: 'New Place',
        description: 'A new test place',
        address: '456 New Street',
        type: 'cafe',
      };

      mockPlacesService.create.mockResolvedValue(mockPlace);

      const result = await controller.create(createPlaceDto, { user: mockUser });

      expect(result).toEqual(mockPlace);
      expect(mockPlacesService.create).toHaveBeenCalledWith(createPlaceDto, 'admin');
    });
  });

  describe('findAll', () => {
    it('should return paginated places with filters', async () => {
      mockPlacesService.findAll.mockResolvedValue({
        places: [mockPlace],
        total: 1,
      });

      const result = await controller.findAll(1, 10, 'food', 'coffee');

      expect(result).toEqual({
        places: [mockPlace],
        total: 1,
      });
      expect(mockPlacesService.findAll).toHaveBeenCalledWith(1, 10, 'food', 'coffee');
    });

    it('should return places with default pagination', async () => {
      mockPlacesService.findAll.mockResolvedValue({
        places: [mockPlace],
        total: 1,
      });

      const result = await controller.findAll();

      expect(result).toEqual({
        places: [mockPlace],
        total: 1,
      });
      expect(mockPlacesService.findAll).toHaveBeenCalledWith(1, 10, undefined, undefined);
    });
  });

  describe('findOne', () => {
    it('should return a place by id', async () => {
      mockPlacesService.findOne.mockResolvedValue(mockPlace);

      const result = await controller.findOne(1);

      expect(result).toEqual(mockPlace);
      expect(mockPlacesService.findOne).toHaveBeenCalledWith(1);
    });
  });

  describe('update', () => {
    it('should update a place', async () => {
      const updatePlaceDto: UpdatePlaceDto = {
        name: 'Updated Place',
      };

      const updatedPlace = { ...mockPlace, name: 'Updated Place' };
      mockPlacesService.update.mockResolvedValue(updatedPlace);

      const result = await controller.update(1, updatePlaceDto, { user: mockUser });

      expect(result).toEqual(updatedPlace);
      expect(mockPlacesService.update).toHaveBeenCalledWith(1, updatePlaceDto, 'admin');
    });
  });

  describe('remove', () => {
    it('should remove a place', async () => {
      mockPlacesService.remove.mockResolvedValue(undefined);

      await controller.remove(1, { user: mockUser });

      expect(mockPlacesService.remove).toHaveBeenCalledWith(1, 'admin');
    });
  });

  describe('getPlacesByType', () => {
    it('should return places by type', async () => {
      mockPlacesService.getPlacesByType.mockResolvedValue([mockPlace]);

      const result = await controller.getPlacesByType('food', 10);

      expect(result).toEqual([mockPlace]);
      expect(mockPlacesService.getPlacesByType).toHaveBeenCalledWith('food', 10);
    });

    it('should return places by type with default limit', async () => {
      mockPlacesService.getPlacesByType.mockResolvedValue([mockPlace]);

      const result = await controller.getPlacesByType('food');

      expect(result).toEqual([mockPlace]);
      expect(mockPlacesService.getPlacesByType).toHaveBeenCalledWith('food', 10);
    });
  });

  describe('getPlacesNearby', () => {
    it('should return nearby places', async () => {
      mockPlacesService.searchPlacesNearby.mockResolvedValue([mockPlace]);

      const result = await controller.getPlacesNearby(37.5665, 126.9780, 5, 20);

      expect(result).toEqual([mockPlace]);
      expect(mockPlacesService.searchPlacesNearby).toHaveBeenCalledWith(37.5665, 126.9780, 5, 20);
    });

    it('should return nearby places with default parameters', async () => {
      mockPlacesService.searchPlacesNearby.mockResolvedValue([mockPlace]);

      const result = await controller.getPlacesNearby(37.5665, 126.9780);

      expect(result).toEqual([mockPlace]);
      expect(mockPlacesService.searchPlacesNearby).toHaveBeenCalledWith(37.5665, 126.9780, 10, 20);
    });
  });
});
