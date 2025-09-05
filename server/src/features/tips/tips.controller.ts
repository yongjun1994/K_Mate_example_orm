import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Request, ParseIntPipe } from '@nestjs/common';
import { TipsService } from './tips.service';
import { CreateTipDto } from './dto/create-tip.dto';
import { UpdateTipDto } from './dto/update-tip.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';

@Controller('tips')
export class TipsController {
  constructor(private readonly tipsService: TipsService) {}

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  create(@Body() createTipDto: CreateTipDto, @Request() req) {
    return this.tipsService.create(createTipDto, req.user.id);
  }

  @Get()
  findAll() {
    return this.tipsService.findAll();
  }

  @Get('type/:tipType')
  findByType(@Param('tipType') tipType: string) {
    return this.tipsService.findByType(tipType);
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.tipsService.findOne(id);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  update(@Param('id', ParseIntPipe) id: number, @Body() updateTipDto: UpdateTipDto, @Request() req) {
    return this.tipsService.update(id, updateTipDto, req.user.id, req.user.role);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  remove(@Param('id', ParseIntPipe) id: number, @Request() req) {
    return this.tipsService.remove(id, req.user.id, req.user.role);
  }

  @Patch(':id/pin')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  togglePin(@Param('id', ParseIntPipe) id: number, @Request() req) {
    return this.tipsService.togglePin(id, req.user.role);
  }
}
