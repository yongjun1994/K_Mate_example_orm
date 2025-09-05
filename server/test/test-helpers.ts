import { Repository } from 'typeorm';
import { User } from '../src/features/users/entities/user.entity';
import { KBuzz } from '../src/features/posts/entities/k-buzz.entity';
import { Comment } from '../src/features/comments/entities/comment.entity';
import { Place } from '../src/features/places/entities/place.entity';
import { Tip } from '../src/features/tips/entities/tip.entity';

export class TestHelpers {
  static async createTestUser(repository: Repository<User>, overrides: Partial<User> = {}): Promise<User> {
    const userData = {
      google_sub: 'test-google-sub',
      email: 'test@example.com',
      name: 'Test User',
      profile_image_url: 'https://example.com/image.jpg',
      is_active: true,
      created_at: new Date(),
      updated_at: new Date(),
      ...overrides,
    };

    const user = repository.create(userData);
    return await repository.save(user);
  }

  static async createTestKBuzz(
    repository: Repository<KBuzz>, 
    authorId: number, 
    overrides: Partial<KBuzz> = {}
  ): Promise<KBuzz> {
    const kBuzzData = {
      title: 'Test K-Buzz Post',
      content: 'This is a test k-buzz post content',
      post_type: 'community' as const,
      category: 'travel_tip' as const,
      view_count: 0,
      scrap_count: 0,
      author_id: authorId,
      created_at: new Date(),
      updated_at: new Date(),
      ...overrides,
    };

    const kBuzz = repository.create(kBuzzData);
    return await repository.save(kBuzz);
  }

  static async createTestComment(
    repository: Repository<Comment>,
    authorId: number,
    kBuzzId: number,
    overrides: Partial<Comment> = {}
  ): Promise<Comment> {
    const commentData = {
      content: 'This is a test comment',
      author_id: authorId,
      k_buzz_id: kBuzzId,
      created_at: new Date(),
      updated_at: new Date(),
      ...overrides,
    };

    const comment = repository.create(commentData);
    return await repository.save(comment);
  }

  static async createTestPlace(
    repository: Repository<Place>,
    overrides: Partial<Place> = {}
  ): Promise<Place> {
    const placeData = {
      type: 'food' as const,
      name: 'Test Place',
      description: 'This is a test place',
      address: '123 Test Street, Test City',
      lat: 37.5665,
      lng: 126.9780,
      google_place_id: 'test-google-place-id',
      phone: '02-1234-5678',
      website: 'https://example.com',
      ...overrides,
    };

    const place = repository.create(placeData);
    return await repository.save(place);
  }

  static async createTestTip(
    repository: Repository<Tip>,
    authorId: number,
    overrides: Partial<Tip> = {}
  ): Promise<Tip> {
    const tipData = {
      title: 'Test Tip',
      content: 'This is a test tip content',
      tip_type: 'bus_guide' as const,
      view_count: 0,
      scrap_count: 0,
      is_pinned: false,
      author_id: authorId,
      created_at: new Date(),
      updated_at: new Date(),
      ...overrides,
    };

    const tip = repository.create(tipData);
    return await repository.save(tip);
  }

  static generateJwtToken(userId: number): string {
    // 실제 구현에서는 JWT 서비스를 사용해야 합니다
    // 테스트용으로 간단한 토큰을 반환합니다
    return `test-jwt-token-${userId}`;
  }

  static async cleanupDatabase(repositories: Repository<any>[]): Promise<void> {
    for (const repository of repositories) {
      await repository.clear();
    }
  }

  static createMockRequest(user: User) {
    return {
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
      },
    };
  }

  static createMockResponse() {
    return {
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis(),
      send: jest.fn().mockReturnThis(),
    };
  }
}
