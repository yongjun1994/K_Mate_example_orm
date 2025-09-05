import { IsString, IsNotEmpty, IsEnum, IsOptional, MaxLength } from 'class-validator';

export class CreateTipDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(200)
  title: string;

  @IsString()
  @IsNotEmpty()
  content: string;

  @IsEnum(['bus_guide', 'subway_guide', 'restaurant_book'])
  tip_type: 'bus_guide' | 'subway_guide' | 'restaurant_book';

  @IsOptional()
  @IsString()
  author_id?: number;
}
