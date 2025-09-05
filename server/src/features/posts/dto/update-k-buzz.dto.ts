import { PartialType } from '@nestjs/mapped-types';
import { CreateKBuzzDto } from './create-k-buzz.dto';

/**
 * K-Buzz 게시글 수정 DTO (Data Transfer Object)
 * 클라이언트에서 서버로 전송되는 게시글 수정 데이터의 구조를 정의
 * 
 * PartialType을 사용하여 CreateKBuzzDto의 모든 필드를 선택적(optional)으로 만듦
 * - 모든 필드가 ? (optional)로 변환됨
 * - 게시글 수정 시 필요한 필드만 전송 가능
 * - CreateKBuzzDto의 검증 규칙을 그대로 상속받음
 */
export class UpdateKBuzzDto extends PartialType(CreateKBuzzDto) {
  // PartialType으로 인해 CreateKBuzzDto의 모든 필드가 자동으로 optional이 됨:
  // - title?: string
  // - content?: string  
  // - post_type?: 'trend' | 'community'
  // - category?: 'travel_tip' | 'food_review' | 'cafe_review'
  // - trend_week?: number
  // - trend_rank?: number
  // - author_id?: number
}
