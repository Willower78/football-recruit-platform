import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { ScoutingCategory, ScoutingDomain } from '../entities/scouting-category.entity';

@Injectable()
export class ScoutingCategoriesService {
  constructor(
    @InjectRepository(ScoutingCategory)
    private readonly repo: Repository<ScoutingCategory>,
  ) {}

  async findAllGrouped(): Promise<Record<ScoutingDomain, ScoutingCategory[]>> {
    const categories = await this.repo.find({
      where: { active: true },
      order: { sortOrder: 'ASC' },
    });

    const grouped: Record<string, ScoutingCategory[]> = {};
    for (const cat of categories) {
      if (!grouped[cat.domain]) grouped[cat.domain] = [];
      grouped[cat.domain].push(cat);
    }
    return grouped as Record<ScoutingDomain, ScoutingCategory[]>;
  }
}
