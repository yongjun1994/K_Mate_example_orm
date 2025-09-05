import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Place } from './entities/place.entity';
import { User } from '../users/entities/user.entity';

@Injectable()
export class PlacesService {
  constructor(
    @InjectRepository(Place)
    private readonly placeRepository: Repository<Place>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  async create(createPlaceDto: { name: string; description?: string; address?: string; type: 'travel' | 'food' | 'cafe'; lat?: number; lng?: number; google_place_id?: string; phone?: string; website?: string }, userRole: string): Promise<Place> {
    if (userRole !== 'admin') {
      throw new ForbiddenException('Only admins can create places');
    }

    const place = this.placeRepository.create(createPlaceDto);
    return await this.placeRepository.save(place);
  }

  async findAll(
    page: number = 1,
    limit: number = 10,
    type?: string,
    search?: string,
  ): Promise<{ places: Place[]; total: number }> {
    const queryBuilder = this.placeRepository.createQueryBuilder('place');

    if (type) {
      queryBuilder.andWhere('place.type = :type', { type });
    }

    if (search) {
      queryBuilder.andWhere(
        '(place.name LIKE :search OR place.description LIKE :search OR place.address LIKE :search)',
        { search: `%${search}%` }
      );
    }

    const [places, total] = await queryBuilder
      .orderBy('place.id', 'DESC')
      .skip((page - 1) * limit)
      .take(limit)
      .getManyAndCount();

    return { places, total };
  }

  async findOne(id: number): Promise<Place | null> {
    return this.placeRepository.findOne({
      where: { id },
      relations: ['bookmarks'],
    });
  }

  async update(id: number, updatePlaceDto: any, userRole: string): Promise<Place> {
    if (userRole !== 'admin') {
      throw new ForbiddenException('Only admins can update places');
    }

    const place = await this.findOne(id);
    if (!place) {
      throw new NotFoundException('Place not found');
    }

    Object.assign(place, updatePlaceDto);
    return await this.placeRepository.save(place);
  }

  async remove(id: number, userRole: string): Promise<void> {
    if (userRole !== 'admin') {
      throw new ForbiddenException('Only admins can delete places');
    }

    const place = await this.findOne(id);
    if (!place) {
      throw new NotFoundException('Place not found');
    }

    await this.placeRepository.remove(place);
  }

  async getPlacesByType(type: 'travel' | 'food' | 'cafe', limit: number = 10): Promise<Place[]> {
    return this.placeRepository.find({
      where: { type },
      order: { id: 'DESC' },
      take: limit,
    });
  }

  async searchPlacesNearby(
    latitude: number,
    longitude: number,
    radius: number = 10,
    limit: number = 20,
  ): Promise<Place[]> {
    return this.placeRepository
      .createQueryBuilder('place')
      .where('place.lat IS NOT NULL')
      .andWhere('place.lng IS NOT NULL')
      .andWhere(
        `(6371 * acos(cos(radians(:lat)) * cos(radians(place.lat)) * cos(radians(place.lng) - radians(:lng)) + sin(radians(:lat)) * sin(radians(place.lat)))) <= :radius`,
        { lat: latitude, lng: longitude, radius }
      )
      .orderBy(
        `(6371 * acos(cos(radians(:lat)) * cos(radians(place.lat)) * cos(radians(place.lng) - radians(:lng)) + sin(radians(:lat)) * sin(radians(place.lat))))`,
        'ASC'
      )
      .limit(limit)
      .getMany();
  }
}
