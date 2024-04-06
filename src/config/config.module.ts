import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { baseConfig } from './base.config';
import { awsConfig } from './aws.config';
import { gptConfig } from './gpt.config';

@Module({
  imports: [
    ConfigModule.forRoot({
      load: [baseConfig, awsConfig, gptConfig],
      isGlobal: true,
      ignoreEnvFile: false,
      cache: true,
    }),
  ],
})
export class AppConfigModule {}
