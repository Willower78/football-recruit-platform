import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Consent } from '../entities/consent.entity';
import { ConsentController } from './consent.controller';
import { ConsentService } from './consent.service';

@Module({
  imports: [TypeOrmModule.forFeature([Consent])],
  controllers: [ConsentController],
  providers: [ConsentService],
  exports: [ConsentService],
})
export class ConsentModule {}
