import { Module } from '@nestjs/common';
import { StorageService } from './storage.service';
import { AwsSdkModule } from 'nest-aws-sdk';

@Module({
  providers: [StorageService],
  exports: [StorageService],
  imports: [AwsSdkModule],
})
export class StorageModule {}
