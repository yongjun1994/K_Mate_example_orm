import { IsString, IsNotEmpty, IsOptional, IsEnum, IsNumber, IsPositive } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { IsKoreanTextLength, IsValidUrl, IsValidCategory } from '../../../common/decorators/validation.decorators';

export class CreatePostDto {
  @ApiProperty({ description: 'Post title', minLength: 2, maxLength: 100 })
  @IsString()
  @IsNotEmpty()
  @IsKoreanTextLength(2, 100, { message: 'Title must be between 2 and 100 characters' })
  title: string;

  @ApiProperty({ description: 'Post content', minLength: 10, maxLength: 5000 })
  @IsString()
  @IsNotEmpty()
  @IsKoreanTextLength(10, 5000, { message: 'Content must be between 10 and 5000 characters' })
  content: string;

  @ApiProperty({ description: 'Image URL', required: false })
  @IsString()
  @IsOptional()
  @IsValidUrl({ message: 'Image URL must be a valid URL' })
  image_url?: string;

  @ApiProperty({ 
    description: 'Post category', 
    enum: ['buzz', 'review', 'question'], 
    default: 'buzz',
    example: 'buzz'
  })
  @IsValidCategory(['buzz', 'review', 'question'], { message: 'Category must be one of: buzz, review, question' })
  @IsOptional()
  category?: 'buzz' | 'review' | 'question';

  @ApiProperty({ description: 'Place ID', required: false, minimum: 1 })
  @IsNumber()
  @IsPositive({ message: 'Place ID must be a positive number' })
  @IsOptional()
  place_id?: number;
}
