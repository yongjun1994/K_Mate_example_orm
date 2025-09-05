import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Request, ParseIntPipe } from '@nestjs/common';
import { KBuzzService } from './k-buzz.service';
import { CreateKBuzzDto } from './dto/create-k-buzz.dto';
import { UpdateKBuzzDto } from './dto/update-k-buzz.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';

@Controller('k-buzz')
export class KBuzzController {
  constructor(private readonly kBuzzService: KBuzzService) {}

  @Post()
  @UseGuards(JwtAuthGuard)
  create(@Body() createKBuzzDto: CreateKBuzzDto, @Request() req) {
    return this.kBuzzService.create(createKBuzzDto, req.user.id);
  }

  @Get()
  findAll() {
    return this.kBuzzService.findAll();
  }

  @Get('trend')
  findTrendPosts() {
    return this.kBuzzService.findTrendPosts();
  }

  @Get('community')
  findCommunityPosts() {
    return this.kBuzzService.findCommunityPosts();
  }

  @Get('category/:category')
  findByCategory(@Param('category') category: string) {
    return this.kBuzzService.findByCategory(category);
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.kBuzzService.findOne(id);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard)
  update(@Param('id', ParseIntPipe) id: number, @Body() updateKBuzzDto: UpdateKBuzzDto, @Request() req) {
    return this.kBuzzService.update(id, updateKBuzzDto, req.user.id, req.user.role);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  remove(@Param('id', ParseIntPipe) id: number, @Request() req) {
    return this.kBuzzService.remove(id, req.user.id, req.user.role);
  }
}
