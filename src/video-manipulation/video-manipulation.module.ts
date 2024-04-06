import { Module } from '@nestjs/common';
import { VideoManipulationService } from './video-manipulation.service';
import { StorageModule } from '@src/storage/storage.module';
import { AwsSdkModule } from 'nest-aws-sdk';

@Module({
  providers: [VideoManipulationService],
  imports: [StorageModule, AwsSdkModule],
  exports: [VideoManipulationService],
})
export class VideoManipulationModule {}
