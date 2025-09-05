import { Controller, Post, Delete, Param, UseGuards, Request, ParseIntPipe, Get } from '@nestjs/common';
import { ScrapsService } from './scraps.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';

@Controller('scraps')
@UseGuards(JwtAuthGuard)
export class ScrapsController {
  constructor(private readonly scrapsService: ScrapsService) {}

  @Post(':postType/:postId')
  scrapPost(
    @Param('postType') postType: 'k_buzz' | 'tips',
    @Param('postId', ParseIntPipe) postId: number,
    @Request() req,
  ) {
    return this.scrapsService.scrapPost(req.user.id, postType, postId);
  }

  @Delete(':postType/:postId')
  unscrapPost(
    @Param('postType') postType: 'k_buzz' | 'tips',
    @Param('postId', ParseIntPipe) postId: number,
    @Request() req,
  ) {
    return this.scrapsService.unscrapPost(req.user.id, postType, postId);
  }

  @Get('my')
  getUserScraps(@Request() req) {
    return this.scrapsService.getUserScraps(req.user.id);
  }

  @Get(':postType/:postId')
  getPostScraps(
    @Param('postType') postType: 'k_buzz' | 'tips',
    @Param('postId', ParseIntPipe) postId: number,
  ) {
    return this.scrapsService.getPostScraps(postType, postId);
  }

  @Get('check/:postType/:postId')
  isScrapped(
    @Param('postType') postType: 'k_buzz' | 'tips',
    @Param('postId', ParseIntPipe) postId: number,
    @Request() req,
  ) {
    return this.scrapsService.isScrapped(req.user.id, postType, postId);
  }
}
