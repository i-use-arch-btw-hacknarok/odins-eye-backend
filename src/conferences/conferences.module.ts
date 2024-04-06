import { Module } from '@nestjs/common';
import { ConferencesService } from './conferences.service';
import { ConferencesController } from './conferences.controller';

@Module({
  providers: [ConferencesService],
  controllers: [ConferencesController],
})
export class ConferencesModule {}
