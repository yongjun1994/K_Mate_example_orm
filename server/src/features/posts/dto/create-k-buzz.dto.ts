import { IsString, IsNotEmpty, IsEnum, IsOptional, MaxLength, IsNumber } from 'class-validator';

export class CreateKBuzzDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(200)
  title: string;

  @IsString()
  @IsNotEmpty()
  content: string;

  @IsEnum(['trend', 'community'])
  post_type: 'trend' | 'community';

  @IsOptional()
  @IsEnum(['travel_tip', 'food_review', 'cafe_review'])
  category?: 'travel_tip' | 'food_review' | 'cafe_review';

  @IsOptional()
  @IsNumber()
  trend_week?: number;

  @IsOptional()
  @IsNumber()
  trend_rank?: number;

  @IsOptional()
  @IsString()
  author_id?: number;
}
