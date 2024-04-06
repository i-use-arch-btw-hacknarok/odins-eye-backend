import { Module } from '@nestjs/common';
import { ConferencesService } from './conferences.service';
import { ConferencesController } from './conferences.controller';
import { StorageModule } from '@src/storage/storage.module';
import { GptModule } from '@src/gpt/gpt.module';

@Module({
  providers: [ConferencesService],
  controllers: [ConferencesController],
  imports: [StorageModule, GptModule],
})
export class ConferencesModule {}
