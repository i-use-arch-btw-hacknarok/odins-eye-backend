import { Module } from '@nestjs/common';
import { RandomnessUtils } from './randomness-utils.service';

@Module({
  providers: [RandomnessUtils],
  exports: [RandomnessUtils],
})
export class UtilsModule {}
