import { Module } from '@nestjs/common';
import { AppConfigModule } from './config/config.module';
import { HealthModule } from './health/health.module';
import { PrometheusModule } from '@willsoto/nestjs-prometheus';
import { DbModule } from './db/db.module';
import { UtilsModule } from './utils/utils.module';
import { ConferencesModule } from './conferences/conferences.module';
import { AwsSdkModule } from 'nest-aws-sdk';
import { requiredEnv } from './config/helpers/requiredEnv';
import { StorageModule } from './storage/storage.module';
import { S3 } from 'aws-sdk';

@Module({
  imports: [
    AwsSdkModule.forRoot({
      defaultServiceOptions: {
        region: 'eu-central-1',
        credentials: {
          accessKeyId: requiredEnv('AWS_ACCESS_KEY_ID'),
          secretAccessKey: requiredEnv('AWS_SECRET_ACCESS_KEY'),
        },
      },
      services: [S3],
    }),
    AppConfigModule,
    HealthModule,
    PrometheusModule.register(),
    DbModule,
    UtilsModule,
    ConferencesModule,
    StorageModule,
  ],
})
export class AppModule {}
