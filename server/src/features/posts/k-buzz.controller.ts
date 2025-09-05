import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Request, ParseIntPipe } from '@nestjs/common';
import { KBuzzService } from './k-buzz.service';
import { CreateKBuzzDto } from './dto/create-k-buzz.dto';
import { UpdateKBuzzDto } from './dto/update-k-buzz.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';

/**
 * K-Buzz 게시글 컨트롤러
 * RESTful API 엔드포인트를 제공하여 게시글 관련 HTTP 요청을 처리
 * JWT 인증과 역할 기반 접근 제어를 적용
 */
@Controller('k-buzz')
export class KBuzzController {
  constructor(private readonly kBuzzService: KBuzzService) {}

  /**
   * 새로운 K-Buzz 게시글 작성
   * JWT 인증이 필요하며, 인증된 사용자가 작성자로 설정됨
   * @param createKBuzzDto 게시글 생성 데이터 (제목, 내용, 타입, 카테고리 등)
   * @param req HTTP 요청 객체 (JWT에서 사용자 정보 추출)
   * @returns 생성된 게시글 정보
   */
  @Post()
  @UseGuards(JwtAuthGuard) // JWT 토큰 인증 필수
  create(@Body() createKBuzzDto: CreateKBuzzDto, @Request() req) {
    return this.kBuzzService.create(createKBuzzDto, req.user.id);
  }

  /**
   * 모든 K-Buzz 게시글 목록 조회
   * 최신순으로 정렬하여 반환 (인증 불필요)
   * @returns 게시글 목록 (작성자 정보 포함)
   */
  @Get()
  findAll() {
    return this.kBuzzService.findAll();
  }

  /**
   * 트렌드 게시글만 조회
   * 관리자가 작성한 트렌드 게시글을 랭킹 순으로 반환
   * @returns 트렌드 게시글 목록
   */
  @Get('trend')
  findTrendPosts() {
    return this.kBuzzService.findTrendPosts();
  }

  /**
   * 커뮤니티 게시글만 조회
   * 일반 사용자가 작성한 커뮤니티 게시글을 최신순으로 반환
   * @returns 커뮤니티 게시글 목록
   */
  @Get('community')
  findCommunityPosts() {
    return this.kBuzzService.findCommunityPosts();
  }

  /**
   * 특정 카테고리의 게시글 조회
   * @param category 조회할 카테고리 (travel_tip, food_review, cafe_review)
   * @returns 해당 카테고리의 게시글 목록
   */
  @Get('category/:category')
  findByCategory(@Param('category') category: string) {
    return this.kBuzzService.findByCategory(category);
  }

  /**
   * 특정 게시글 상세 조회
   * 조회 시 조회수가 자동으로 증가됨
   * @param id 게시글 ID (URL 파라미터에서 추출)
   * @returns 게시글 상세 정보
   */
  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.kBuzzService.findOne(id);
  }

  /**
   * 게시글 수정
   * JWT 인증이 필요하며, 권한 확인 후 수정 가능
   * - 트렌드 게시글: 관리자만 수정 가능
   * - 커뮤니티 게시글: 작성자 본인 또는 관리자만 수정 가능
   * @param id 수정할 게시글 ID
   * @param updateKBuzzDto 수정할 데이터
   * @param req HTTP 요청 객체 (JWT에서 사용자 정보 추출)
   * @returns 수정된 게시글 정보
   */
  @Patch(':id')
  @UseGuards(JwtAuthGuard) // JWT 토큰 인증 필수
  update(@Param('id', ParseIntPipe) id: number, @Body() updateKBuzzDto: UpdateKBuzzDto, @Request() req) {
    return this.kBuzzService.update(id, updateKBuzzDto, req.user.id, req.user.role);
  }

  /**
   * 게시글 삭제
   * JWT 인증이 필요하며, 권한 확인 후 삭제 가능
   * - 트렌드 게시글: 관리자만 삭제 가능
   * - 커뮤니티 게시글: 작성자 본인 또는 관리자만 삭제 가능
   * @param id 삭제할 게시글 ID
   * @param req HTTP 요청 객체 (JWT에서 사용자 정보 추출)
   * @returns 삭제 완료 응답
   */
  @Delete(':id')
  @UseGuards(JwtAuthGuard) // JWT 토큰 인증 필수
  remove(@Param('id', ParseIntPipe) id: number, @Request() req) {
    return this.kBuzzService.remove(id, req.user.id, req.user.role);
  }
}
