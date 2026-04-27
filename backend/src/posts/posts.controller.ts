import { Body, Controller, Delete, Get, Param, Post, Query, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { PostsService } from './posts.service';
import { CreatePostDto } from './dto/create-post.dto';
import { CreateCommentDto } from './dto/create-comment.dto';
import { Public } from '../auth/decorators/public.decorator';
import { OptionalJwtAuthGuard } from '../auth/guards/optional-jwt-auth.guard';
import { CurrentUser, JwtUser } from '../auth/decorators/current-user.decorator';

@ApiTags('social')
@Controller('social')
export class PostsController {
  constructor(private readonly service: PostsService) {}

  @ApiBearerAuth()
  @Post('posts')
  createPost(@CurrentUser() user: JwtUser, @Body() dto: CreatePostDto) {
    return this.service.createPost(user.sub, dto);
  }

  @Public()
  @UseGuards(OptionalJwtAuthGuard)
  @Get('feed')
  getFeed(
    @CurrentUser() user: JwtUser | undefined,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    return this.service.getFeed(
      user?.sub ?? null,
      page ? Number(page) : 1,
      limit ? Number(limit) : 20,
    );
  }

  @ApiBearerAuth()
  @Post('posts/:id/like')
  toggleLike(@Param('id') id: string, @CurrentUser() user: JwtUser) {
    return this.service.toggleLike(id, user.sub);
  }

  @ApiBearerAuth()
  @Post('posts/:id/comments')
  addComment(
    @Param('id') id: string,
    @CurrentUser() user: JwtUser,
    @Body() dto: CreateCommentDto,
  ) {
    return this.service.addComment(id, user.sub, dto);
  }

  @Public()
  @Get('posts/:id/comments')
  getComments(
    @Param('id') id: string,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    return this.service.getComments(id, page ? Number(page) : 1, limit ? Number(limit) : 20);
  }

  @ApiBearerAuth()
  @Delete('posts/:id')
  deletePost(@Param('id') id: string, @CurrentUser() user: JwtUser) {
    return this.service.deletePost(id, user.sub);
  }

  @ApiBearerAuth()
  @Post('follow/:userId')
  toggleFollow(@Param('userId') targetId: string, @CurrentUser() user: JwtUser) {
    return this.service.follow(user.sub, targetId);
  }

  @ApiBearerAuth()
  @Get('followers')
  getFollowers(@CurrentUser() user: JwtUser) {
    return this.service.getFollowers(user.sub);
  }

  @ApiBearerAuth()
  @Get('following')
  getFollowing(@CurrentUser() user: JwtUser) {
    return this.service.getFollowing(user.sub);
  }
}
