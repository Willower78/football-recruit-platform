import { Controller, Get } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { DataSource } from 'typeorm';
import { Public } from '../common/decorators/public.decorator';

@ApiTags('health')
@Controller('health')
export class HealthController {
  constructor(private readonly dataSource: DataSource) {}

  @Public()
  @Get()
  async check(): Promise<{
    status: 'ok';
    timestamp: string;
    database: 'connected' | 'disconnected';
  }> {
    let database: 'connected' | 'disconnected' = 'disconnected';
    try {
      await this.dataSource.query('SELECT 1');
      database = 'connected';
    } catch {
      database = 'disconnected';
    }
    return {
      status: 'ok',
      timestamp: new Date().toISOString(),
      database,
    };
  }
}
