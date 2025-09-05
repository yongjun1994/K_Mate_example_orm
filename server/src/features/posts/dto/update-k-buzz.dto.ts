import { PartialType } from '@nestjs/mapped-types';
import { CreateKBuzzDto } from './create-k-buzz.dto';

export class UpdateKBuzzDto extends PartialType(CreateKBuzzDto) {}
