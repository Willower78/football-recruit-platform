import { ConfigService } from '@nestjs/config';
import { TypeOrmModuleOptions } from '@nestjs/typeorm';

export const typeOrmConfigFactory = (
  config: ConfigService,
): TypeOrmModuleOptions => ({
  type: 'postgres',
  url: config.get<string>('DATABASE_URL'),
  autoLoadEntities: true,
  // Schema is managed by SQL migrations in /database/migrations.
  synchronize: false,
  logging: ['error', 'warn'],
});
