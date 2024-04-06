import { Module } from '@nestjs/common';
import { AppConfigModule } from './config/config.module';
import { HealthModule } from './health/health.module';
import { PrometheusModule } from '@willsoto/nestjs-prometheus';
import { DbModule } from './db/db.module';
import { UtilsModule } from './utils/utils.module';

@Module({
  imports: [AppConfigModule, HealthModule, PrometheusModule.register(), DbModule, UtilsModule],
})
export class AppModule {}
