import { Module } from '@nestjs/common';
import { SttService } from './stt.service';
import { StorageModule } from '@src/storage/storage.module';

@Module({
  providers: [SttService],
  imports: [StorageModule],
})
export class SttModule {}
