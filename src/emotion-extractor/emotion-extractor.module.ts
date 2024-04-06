import { Module } from '@nestjs/common';
import { EmotionExtractorService } from './emotion-extractor.service';
import { StorageModule } from '@src/storage/storage.module';
import { VideoManipulationModule } from '@src/video-manipulation/video-manipulation.module';

@Module({
  providers: [EmotionExtractorService],
  imports: [StorageModule, VideoManipulationModule],
})
export class EmotionExtractorModule {}
