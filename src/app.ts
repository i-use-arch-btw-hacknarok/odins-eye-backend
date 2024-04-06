import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { BaseConfig, baseConfig } from './config/base.config';
import 'source-map-support/register';
import { CorsOptions } from '@nestjs/common/interfaces/external/cors-options.interface';
import { DefaultTransportConsole, NestTransportLogger } from 'nest-logging-transport';

export const createApp = async () => {
  const customLogging = new NestTransportLogger({ transports: [new DefaultTransportConsole()] });

  const app = await NestFactory.create(AppModule, { logger: customLogging });

  const corsOptions: CorsOptions = {
    origin: '*',
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    allowedHeaders: 'Content-Type,Authorization',
  };
  app.enableCors(corsOptions);

  app.useGlobalPipes(
    new ValidationPipe({
      transform: true,
    }),
  );
  const { port, swaggerEnabled } = app.get<BaseConfig>(baseConfig.KEY);

  return { app, port, swaggerEnabled };
};
