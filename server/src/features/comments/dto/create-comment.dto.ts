import { IsString, IsNotEmpty } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { IsKoreanTextLength } from '../../../common/decorators/validation.decorators';

export class CreateCommentDto {
  @ApiProperty({ description: 'Comment content', minLength: 1, maxLength: 1000 })
  @IsString()
  @IsNotEmpty()
  @IsKoreanTextLength(1, 1000, { message: 'Comment content must be between 1 and 1000 characters' })
  content: string;
}
