import { 
  Controller, 
  Get, 
  Post, 
  Param, 
  Delete, 
  Query, 
  UseGuards, 
  Request,
  ParseIntPipe
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { BookmarksService } from './bookmarks.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';

@ApiTags('bookmarks')
@Controller('bookmarks')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class BookmarksController {
  constructor(private readonly bookmarksService: BookmarksService) {}

  @Post('toggle/:placeId')
  @ApiOperation({ summary: 'Toggle bookmark for a place' })
  @ApiResponse({ status: 201, description: 'Bookmark toggled successfully' })
  async toggleBookmark(@Param('placeId', ParseIntPipe) placeId: number, @Request() req) {
    const result = await this.bookmarksService.toggleBookmark(placeId, req.user.id);
    return {
      message: result.bookmarked ? 'Place bookmarked successfully' : 'Bookmark removed successfully',
      ...result
    };
  }

  @Get('my-bookmarks')
  @ApiOperation({ summary: 'Get current user bookmarks' })
  @ApiResponse({ status: 200, description: 'User bookmarks retrieved successfully' })
  @ApiQuery({ name: 'page', required: false, type: Number, description: 'Page number' })
  @ApiQuery({ name: 'limit', required: false, type: Number, description: 'Items per page' })
  async getMyBookmarks(
    @Request() req,
    @Query('page') page: number = 1,
    @Query('limit') limit: number = 10,
  ) {
    return this.bookmarksService.getUserBookmarks(req.user.id, page, limit);
  }

  @Get('status/:placeId')
  @ApiOperation({ summary: 'Check if place is bookmarked by current user' })
  @ApiResponse({ status: 200, description: 'Bookmark status retrieved successfully' })
  async getBookmarkStatus(@Param('placeId', ParseIntPipe) placeId: number, @Request() req) {
    return this.bookmarksService.getBookmarkStatus(placeId, req.user.id);
  }

  @Delete(':placeId')
  @ApiOperation({ summary: 'Remove bookmark for a place' })
  @ApiResponse({ status: 200, description: 'Bookmark removed successfully' })
  async removeBookmark(@Param('placeId', ParseIntPipe) placeId: number, @Request() req) {
    await this.bookmarksService.removeBookmark(placeId, req.user.id);
    return { message: 'Bookmark removed successfully' };
  }
}
