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
import { PlayerProfile } from '../entities/player-profile.entity';
import { SearchPlayersDto } from './dto/search-players.dto';
import { UpdatePlayerProfileDto } from './dto/update-player-profile.dto';
import { PlayerProfilesService } from './player-profiles.service';

@ApiTags('players')
@UseGuards(RolesGuard)
@Controller('players')
export class PlayerProfilesController {
  constructor(private readonly service: PlayerProfilesService) {}

  @Get('me')
  @Roles('player')
  @ApiBearerAuth()
  getMe(@CurrentUser() user: JwtUser): Promise<PlayerProfile> {
    return this.service.findOwn(user.sub);
  }

  @Patch('me')
  @Roles('player')
  @ApiBearerAuth()
  updateMe(
    @CurrentUser() user: JwtUser,
    @Body() dto: UpdatePlayerProfileDto,
  ): Promise<PlayerProfile> {
    return this.service.updateOwn(user.sub, dto);
  }

  @Public()
  @Get()
  search(@Query() query: SearchPlayersDto): Promise<{
    data: PlayerProfile[];
    page: number;
    limit: number;
    total: number;
  }> {
    return this.service.search(query);
  }

  @Get(':id')
  @ApiBearerAuth()
  getById(
    @Param('id', new ParseUUIDPipe()) id: string,
    @CurrentUser() user: JwtUser,
  ): Promise<PlayerProfile> {
    return this.service.findById(id, user ?? null);
  }
}
