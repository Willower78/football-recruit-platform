import {
  Body,
  Controller,
  Get,
  Param,
  ParseUUIDPipe,
  Patch,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import {
  CurrentUser,
  JwtUser,
} from '../common/decorators/current-user.decorator';
import { Public } from '../common/decorators/public.decorator';
import { Roles } from '../common/decorators/roles.decorator';
import { RolesGuard } from '../common/guards/roles.guard';
import { ClubProfile } from '../entities/club-profile.entity';
import { ClubProfilesService } from './club-profiles.service';
import { SearchClubsDto } from './dto/search-clubs.dto';
import { UpdateClubProfileDto } from './dto/update-club-profile.dto';

@ApiTags('clubs')
@UseGuards(RolesGuard)
@Controller('clubs')
export class ClubProfilesController {
  constructor(private readonly service: ClubProfilesService) {}

  @Get('me')
  @Roles('club')
  @ApiBearerAuth()
  getMe(@CurrentUser() user: JwtUser): Promise<ClubProfile> {
    return this.service.findOwn(user.sub);
  }

  @Patch('me')
  @Roles('club')
  @ApiBearerAuth()
  updateMe(
    @CurrentUser() user: JwtUser,
    @Body() dto: UpdateClubProfileDto,
  ): Promise<ClubProfile> {
    return this.service.updateOwn(user.sub, dto);
  }

  @Public()
  @Get()
  search(@Query() query: SearchClubsDto): Promise<{
    data: ClubProfile[];
    page: number;
    limit: number;
    total: number;
  }> {
    return this.service.search(query);
  }

  @Public()
  @Get(':id')
  getById(
    @Param('id', new ParseUUIDPipe()) id: string,
  ): Promise<ClubProfile> {
    return this.service.findById(id);
  }
}
