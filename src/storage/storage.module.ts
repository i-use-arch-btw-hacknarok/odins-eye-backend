import { Module } from '@nestjs/common';
import { StorageService } from './storage.service';
import { AwsSdkModule } from 'nest-aws-sdk';
import { S3 } from 'aws-sdk';

@Module({
  providers: [StorageService],
  exports: [StorageService],
  imports: [AwsSdkModule.forFeatures([S3])],
})
export class StorageModule {}
