import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { PlacesService } from './places.service';
import { Place } from './entities/place.entity';
import { User } from '../users/entities/user.entity';

// Jest 타입 정의를 위한 import
/// <reference types="jest" />

describe('PlacesService', () => {
  let service: PlacesService;
  let placeRepository: Repository<Place>;
  let userRepository: Repository<User>;

  const mockPlace: Place = {
    id: 1,
    type: 'food',
    name: 'Test Place',
    description: 'This is a test place',
    address: '123 Test Street, Test City',
    lat: 37.5665,
    lng: 126.9780,
    google_place_id: 'test-google-place-id',
    phone: '02-1234-5678',
    website: 'https://example.com',
    bookmarks: [],
  };

  const mockPlaceRepository = {
    create: jest.fn(),
    save: jest.fn(),
    find: jest.fn(),
    findOne: jest.fn(),
    update: jest.fn(),
    remove: jest.fn(),
    createQueryBuilder: jest.fn(),
    findAndCount: jest.fn(),
  };

  const mockUserRepository = {
    findOne: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PlacesService,
        {
          provide: getRepositoryToken(Place),
          useValue: mockPlaceRepository,
        },
        {
          provide: getRepositoryToken(User),
          useValue: mockUserRepository,
        },
      ],
    }).compile();

    service = module.get<PlacesService>(PlacesService);
    placeRepository = module.get<Repository<Place>>(getRepositoryToken(Place));
    userRepository = module.get<Repository<User>>(getRepositoryToken(User));
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('should create a new place', async () => {
      const createPlaceDto = {
        name: 'New Place',
        description: 'A new test place',
        address: '456 New Street',
        type: 'cafe' as const,
      };

      mockPlaceRepository.create.mockReturnValue(mockPlace);
      mockPlaceRepository.save.mockResolvedValue(mockPlace);

      const result = await service.create(createPlaceDto, 'admin');

      expect(result).toEqual(mockPlace);
      expect(mockPlaceRepository.create).toHaveBeenCalledWith(createPlaceDto);
    });

    it('should throw ForbiddenException for non-admin users', async () => {
      const createPlaceDto = {
        name: 'New Place',
        description: 'A new test place',
        address: '456 New Street',
        type: 'cafe' as const,
      };

      await expect(service.create(createPlaceDto, 'user')).rejects.toThrow('Only admins can create places');
    });
  });

  describe('findAll', () => {
    it('should return paginated places with filters', async () => {
      const mockQueryBuilder = {
        andWhere: jest.fn().mockReturnThis(),
        orderBy: jest.fn().mockReturnThis(),
        skip: jest.fn().mockReturnThis(),
        take: jest.fn().mockReturnThis(),
        getManyAndCount: jest.fn().mockResolvedValue([[mockPlace], 1]),
      };

      mockPlaceRepository.createQueryBuilder.mockReturnValue(mockQueryBuilder);

      const result = await service.findAll(1, 10, 'food', 'test');

      expect(result).toEqual({ places: [mockPlace], total: 1 });
      expect(mockQueryBuilder.andWhere).toHaveBeenCalledWith('place.type = :type', { type: 'food' });
    });

    it('should return places with search filter', async () => {
      const mockQueryBuilder = {
        andWhere: jest.fn().mockReturnThis(),
        orderBy: jest.fn().mockReturnThis(),
        skip: jest.fn().mockReturnThis(),
        take: jest.fn().mockReturnThis(),
        getManyAndCount: jest.fn().mockResolvedValue([[mockPlace], 1]),
      };

      mockPlaceRepository.createQueryBuilder.mockReturnValue(mockQueryBuilder);

      const result = await service.findAll(1, 10, undefined, 'coffee');

      expect(result).toEqual({ places: [mockPlace], total: 1 });
      expect(mockQueryBuilder.andWhere).toHaveBeenCalledWith(
        '(place.name LIKE :search OR place.description LIKE :search OR place.address LIKE :search)',
        { search: '%coffee%' }
      );
    });
  });

  describe('findOne', () => {
    it('should return a place by id', async () => {
      mockPlaceRepository.findOne.mockResolvedValue(mockPlace);

      const result = await service.findOne(1);

      expect(result).toEqual(mockPlace);
      expect(mockPlaceRepository.findOne).toHaveBeenCalledWith({
        where: { id: 1 },
        relations: ['bookmarks'],
      });
    });

    it('should return null when place not found', async () => {
      mockPlaceRepository.findOne.mockResolvedValue(null);

      const result = await service.findOne(999);

      expect(result).toBeNull();
    });
  });

  describe('update', () => {
    it('should update a place', async () => {
      const updatePlaceDto = { name: 'Updated Place' };
      const updatedPlace = { ...mockPlace, name: 'Updated Place' };

      mockPlaceRepository.findOne.mockResolvedValue(mockPlace);
      mockPlaceRepository.save.mockResolvedValue(updatedPlace);

      const result = await service.update(1, updatePlaceDto, 'admin');

      expect(result).toEqual(updatedPlace);
      expect(mockPlaceRepository.save).toHaveBeenCalledWith(updatedPlace);
    });

    it('should throw error when place not found', async () => {
      const updatePlaceDto = { name: 'Updated Place' };

      mockPlaceRepository.findOne.mockResolvedValue(null);

      await expect(service.update(999, updatePlaceDto, 'admin')).rejects.toThrow('Place not found');
    });

    it('should throw ForbiddenException for non-admin users', async () => {
      const updatePlaceDto = { name: 'Updated Place' };

      await expect(service.update(1, updatePlaceDto, 'user')).rejects.toThrow('Only admins can update places');
    });
  });

  describe('remove', () => {
    it('should remove a place', async () => {
      mockPlaceRepository.findOne.mockResolvedValue(mockPlace);
      mockPlaceRepository.remove.mockResolvedValue(mockPlace);

      await service.remove(1, 'admin');

      expect(mockPlaceRepository.remove).toHaveBeenCalledWith(mockPlace);
    });

    it('should throw ForbiddenException for non-admin users', async () => {
      await expect(service.remove(1, 'user')).rejects.toThrow('Only admins can delete places');
    });
  });

  describe('getPlacesByType', () => {
    it('should return places by type', async () => {
      mockPlaceRepository.find.mockResolvedValue([mockPlace]);

      const result = await service.getPlacesByType('food', 10);

      expect(result).toEqual([mockPlace]);
      expect(mockPlaceRepository.find).toHaveBeenCalledWith({
        where: { type: 'food' },
        order: { id: 'DESC' },
        take: 10,
      });
    });
  });

  describe('searchPlacesNearby', () => {
    it('should return nearby places', async () => {
      const mockQueryBuilder = {
        where: jest.fn().mockReturnThis(),
        andWhere: jest.fn().mockReturnThis(),
        orderBy: jest.fn().mockReturnThis(),
        limit: jest.fn().mockReturnThis(),
        getMany: jest.fn().mockResolvedValue([mockPlace]),
      };

      mockPlaceRepository.createQueryBuilder.mockReturnValue(mockQueryBuilder);

      const result = await service.searchPlacesNearby(37.5665, 126.9780, 5, 20);

      expect(result).toEqual([mockPlace]);
      expect(mockQueryBuilder.where).toHaveBeenCalledWith('place.lat IS NOT NULL');
      expect(mockQueryBuilder.andWhere).toHaveBeenCalledWith('place.lng IS NOT NULL');
    });
  });
});
