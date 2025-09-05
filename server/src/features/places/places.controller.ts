import { 
  Controller, 
  Get, 
  Post, 
  Body, 
  Patch, 
  Param, 
  Delete, 
  Query, 
  UseGuards,
  Request,
  ParseIntPipe
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { PlacesService } from './places.service';
import { CreatePlaceDto } from './dto/create-place.dto';
import { UpdatePlaceDto } from './dto/update-place.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';

@ApiTags('places')
@Controller('places')
export class PlacesController {
  constructor(private readonly placesService: PlacesService) {}

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create a new place (Admin only)' })
  @ApiResponse({ status: 201, description: 'Place created successfully' })
  async create(@Body() createPlaceDto: CreatePlaceDto, @Request() req) {
    return this.placesService.create(createPlaceDto, req.user.role);
  }

  @Get()
  @ApiOperation({ summary: 'Get all places with pagination and filters' })
  @ApiResponse({ status: 200, description: 'Places retrieved successfully' })
  @ApiQuery({ name: 'page', required: false, type: Number, description: 'Page number' })
  @ApiQuery({ name: 'limit', required: false, type: Number, description: 'Items per page' })
  @ApiQuery({ name: 'type', required: false, type: String, description: 'Filter by type' })
  @ApiQuery({ name: 'search', required: false, type: String, description: 'Search in name, description, and address' })
  async findAll(
    @Query('page') page: number = 1,
    @Query('limit') limit: number = 10,
    @Query('type') type?: string,
    @Query('search') search?: string,
  ) {
    return this.placesService.findAll(page, limit, type, search);
  }

  @Get('type/:type')
  @ApiOperation({ summary: 'Get places by type' })
  @ApiResponse({ status: 200, description: 'Places by type retrieved successfully' })
  @ApiQuery({ name: 'limit', required: false, type: Number, description: 'Number of places to return' })
  async getPlacesByType(
    @Param('type') type: 'travel' | 'food' | 'cafe',
    @Query('limit') limit: number = 10,
  ) {
    return this.placesService.getPlacesByType(type, limit);
  }

  @Get('nearby')
  @ApiOperation({ summary: 'Get places nearby' })
  @ApiResponse({ status: 200, description: 'Nearby places retrieved successfully' })
  @ApiQuery({ name: 'latitude', required: true, type: Number, description: 'Latitude' })
  @ApiQuery({ name: 'longitude', required: true, type: Number, description: 'Longitude' })
  @ApiQuery({ name: 'radius', required: false, type: Number, description: 'Search radius in km' })
  @ApiQuery({ name: 'limit', required: false, type: Number, description: 'Number of places to return' })
  async getPlacesNearby(
    @Query('latitude') latitude: number,
    @Query('longitude') longitude: number,
    @Query('radius') radius: number = 10,
    @Query('limit') limit: number = 20,
  ) {
    return this.placesService.searchPlacesNearby(latitude, longitude, radius, limit);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get place by ID' })
  @ApiResponse({ status: 200, description: 'Place retrieved successfully' })
  async findOne(@Param('id', ParseIntPipe) id: number) {
    return this.placesService.findOne(id);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update place (Admin only)' })
  @ApiResponse({ status: 200, description: 'Place updated successfully' })
  async update(@Param('id', ParseIntPipe) id: number, @Body() updatePlaceDto: UpdatePlaceDto, @Request() req) {
    return this.placesService.update(id, updatePlaceDto, req.user.role);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Delete place (Admin only)' })
  @ApiResponse({ status: 200, description: 'Place deleted successfully' })
  async remove(@Param('id', ParseIntPipe) id: number, @Request() req) {
    await this.placesService.remove(id, req.user.role);
    return { message: 'Place deleted successfully' };
  }
}
