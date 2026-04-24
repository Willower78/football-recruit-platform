import { ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { SavedSearch } from '../entities/saved-search.entity';
import { CreateSavedSearchDto, UpdateSavedSearchDto } from './dto/saved-search.dto';

@Injectable()
export class SavedSearchesService {
  constructor(
    @InjectRepository(SavedSearch)
    private readonly repo: Repository<SavedSearch>,
  ) {}

  async create(userId: string, dto: CreateSavedSearchDto): Promise<SavedSearch> {
    const entity = this.repo.create({
      userId,
      name: dto.name,
      filters: dto.filters,
      sortBy: dto.sortBy ?? null,
      sortOrder: dto.sortOrder ?? 'desc',
    });
    return this.repo.save(entity);
  }

  async findAllForUser(userId: string): Promise<SavedSearch[]> {
    return this.repo.find({
      where: { userId },
      order: { updatedAt: 'DESC' },
    });
  }

  async update(id: string, userId: string, dto: UpdateSavedSearchDto): Promise<SavedSearch> {
    const search = await this.repo.findOne({ where: { id } });
    if (!search) throw new NotFoundException('Saved search not found');
    if (search.userId !== userId) throw new ForbiddenException();

    if (dto.name !== undefined) search.name = dto.name;
    if (dto.filters !== undefined) search.filters = dto.filters;
    if (dto.sortBy !== undefined) search.sortBy = dto.sortBy;
    if (dto.sortOrder !== undefined) search.sortOrder = dto.sortOrder;

    return this.repo.save(search);
  }

  async remove(id: string, userId: string): Promise<void> {
    const search = await this.repo.findOne({ where: { id } });
    if (!search) throw new NotFoundException('Saved search not found');
    if (search.userId !== userId) throw new ForbiddenException();
    await this.repo.remove(search);
  }
}
