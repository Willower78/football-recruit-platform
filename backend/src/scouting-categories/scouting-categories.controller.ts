import { Controller, Get } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';

import { Public } from '../auth/decorators/public.decorator';
import { ScoutingCategoriesService } from './scouting-categories.service';

@ApiTags('scouting-categories')
@Controller('scouting-categories')
export class ScoutingCategoriesController {
  constructor(private readonly service: ScoutingCategoriesService) {}

  @Public()
  @Get()
  findAll() {
    return this.service.findAllGrouped();
  }
}
