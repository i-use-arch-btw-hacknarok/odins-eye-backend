import { Module } from '@nestjs/common';
import { ConferencesService } from './conferences.service';
import { ConferencesController } from './conferences.controller';
import { StorageModule } from '@src/storage/storage.module';

@Module({
  providers: [ConferencesService],
  controllers: [ConferencesController],
  imports: [StorageModule],
})
export class ConferencesModule {}
