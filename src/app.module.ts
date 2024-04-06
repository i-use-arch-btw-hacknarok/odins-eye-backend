import { Module } from '@nestjs/common';
import { AppConfigModule } from './config/config.module';
import { HealthModule } from './health/health.module';
import { PrometheusModule } from '@willsoto/nestjs-prometheus';
import { DbModule } from './db/db.module';
import { UtilsModule } from './utils/utils.module';
import { ConferencesModule } from './conferences/conferences.module';
import { AwsSdkModule } from 'nest-aws-sdk';
import { StorageModule } from './storage/storage.module';
import { AWS_CONFIG_KEY } from './config/aws.config';
import { S3 } from 'aws-sdk';
import { ConfigService } from '@nestjs/config';

@Module({
  imports: [
    AwsSdkModule.forRootAsync({
      defaultServiceOptions: {
        imports: [AppConfigModule],
        inject: [ConfigService],
        useFactory: (configService: ConfigService) => {
          const awsConfig = configService.getOrThrow(AWS_CONFIG_KEY);
          return {
            region: awsConfig.region,
            credentials: {
              accessKeyId: awsConfig.accessKeyId,
              secretAccessKey: awsConfig.secretAccessKey,
            },
          };
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
