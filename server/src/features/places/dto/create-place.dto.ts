import { IsString, IsNotEmpty, IsOptional, IsEnum, IsNumber, IsLatitude, IsLongitude } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreatePlaceDto {
  @ApiProperty({ description: 'Place type', enum: ['travel', 'food', 'cafe'] })
  @IsEnum(['travel', 'food', 'cafe'])
  type: 'travel' | 'food' | 'cafe';

  @ApiProperty({ description: 'Place name', minLength: 2, maxLength: 255 })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({ description: 'Place description', required: false })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiProperty({ description: 'Google Place ID', required: false })
  @IsString()
  @IsOptional()
  google_place_id?: string;

  @ApiProperty({ description: 'Latitude', example: 37.5665 })
  @IsLatitude({ message: 'Latitude must be a valid latitude value' })
  lat: number;

  @ApiProperty({ description: 'Longitude', example: 126.9780 })
  @IsLongitude({ message: 'Longitude must be a valid longitude value' })
  lng: number;

  @ApiProperty({ description: 'Place address', required: false })
  @IsString()
  @IsOptional()
  address?: string;

  @ApiProperty({ description: 'Phone number', required: false })
  @IsString()
  @IsOptional()
  phone?: string;

  @ApiProperty({ description: 'Website URL', required: false })
  @IsString()
  @IsOptional()
  website?: string;
}
