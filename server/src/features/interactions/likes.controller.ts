import { Controller, Post, Delete, Param, UseGuards, Request, ParseIntPipe, Get, Query } from '@nestjs/common';
import { LikesService } from './likes.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';

@Controller('likes')
@UseGuards(JwtAuthGuard)
export class LikesController {
  constructor(private readonly likesService: LikesService) {}

  @Post(':postType/:postId')
  likePost(
    @Param('postType') postType: 'k_buzz' | 'tips',
    @Param('postId', ParseIntPipe) postId: number,
    @Request() req,
  ) {
    return this.likesService.likePost(req.user.id, postType, postId);
  }

  @Delete(':postType/:postId')
  unlikePost(
    @Param('postType') postType: 'k_buzz' | 'tips',
    @Param('postId', ParseIntPipe) postId: number,
    @Request() req,
  ) {
    return this.likesService.unlikePost(req.user.id, postType, postId);
  }

  @Get('my')
  getUserLikes(@Request() req) {
    return this.likesService.getUserLikes(req.user.id);
  }

  @Get(':postType/:postId')
  getPostLikes(
    @Param('postType') postType: 'k_buzz' | 'tips',
    @Param('postId', ParseIntPipe) postId: number,
  ) {
    return this.likesService.getPostLikes(postType, postId);
  }

  @Get('check/:postType/:postId')
  isLiked(
    @Param('postType') postType: 'k_buzz' | 'tips',
    @Param('postId', ParseIntPipe) postId: number,
    @Request() req,
  ) {
    return this.likesService.isLiked(req.user.id, postType, postId);
  }
}
