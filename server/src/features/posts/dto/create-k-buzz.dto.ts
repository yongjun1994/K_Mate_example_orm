import { IsString, IsNotEmpty, IsEnum, IsOptional, MaxLength, IsNumber } from 'class-validator';

/**
 * K-Buzz 게시글 생성 DTO (Data Transfer Object)
 * 클라이언트에서 서버로 전송되는 게시글 생성 데이터의 구조와 검증 규칙을 정의
 * class-validator 데코레이터를 사용하여 입력 데이터 검증
 */
export class CreateKBuzzDto {
  /**
   * 게시글 제목
   * - 필수 입력 필드
   * - 문자열 타입
   * - 최대 200자 제한
   */
  @IsString()
  @IsNotEmpty()
  @MaxLength(200)
  title: string;

  /**
   * 게시글 내용
   * - 필수 입력 필드
   * - 문자열 타입
   * - 길이 제한 없음 (longtext로 저장)
   */
  @IsString()
  @IsNotEmpty()
  content: string;

  /**
   * 게시글 타입
   * - 필수 입력 필드
   * - enum 값으로 제한: 'trend' 또는 'community'
   * - trend: 관리자가 작성하는 트렌드 게시글
   * - community: 일반 사용자가 작성하는 커뮤니티 게시글
   */
  @IsEnum(['trend', 'community'])
  post_type: 'trend' | 'community';

  /**
   * 게시글 카테고리
   * - 선택적 입력 필드 (nullable)
   * - enum 값으로 제한: 'travel_tip', 'food_review', 'cafe_review'
   * - travel_tip: 여행 팁
   * - food_review: 맛집 리뷰
   * - cafe_review: 카페 리뷰
   */
  @IsOptional()
  @IsEnum(['travel_tip', 'food_review', 'cafe_review'])
  category?: 'travel_tip' | 'food_review' | 'cafe_review';

  /**
   * 트렌드 주차
   * - 선택적 입력 필드
   * - 숫자 타입
   * - 트렌드 게시글의 경우 몇 주차 트렌드인지 표시
   * - 커뮤니티 게시글의 경우 null
   */
  @IsOptional()
  @IsNumber()
  trend_week?: number;

  /**
   * 트렌드 랭킹
   * - 선택적 입력 필드
   * - 숫자 타입
   * - 해당 주차 내에서의 트렌드 순위
   * - 커뮤니티 게시글의 경우 null
   */
  @IsOptional()
  @IsNumber()
  trend_rank?: number;

  /**
   * 작성자 ID
   * - 선택적 입력 필드 (실제로는 JWT에서 추출)
   * - 숫자 타입
   * - 주로 서버에서 JWT 토큰에서 추출하여 설정
   * - 클라이언트에서 직접 전송하지 않음 (보안상 이유)
   */
  @IsOptional()
  @IsString()
  author_id?: number;
}
