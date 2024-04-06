import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { baseConfig } from './base.config';
import { awsConfig } from './aws.config';

@Module({
  imports: [
    ConfigModule.forRoot({
      load: [baseConfig, awsConfig],
      isGlobal: true,
      ignoreEnvFile: false,
      cache: true,
    }),
  ],
})
export class AppConfigModule {}
