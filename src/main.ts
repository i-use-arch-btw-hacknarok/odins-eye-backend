import 'source-map-support/register';
import { createApp } from './app';
import { Logger } from '@nestjs/common';
import { setupSwagger } from './swagger';

const bootstrap = async () => {
  const { app, port, swaggerEnabled } = await createApp();

  const logger = new Logger('Bootstrap');

  if (swaggerEnabled) {
    setupSwagger(app);
  }

  await app.listen(port, () => {
    logger.log(`Server listening on http://localhost:${port}`);
    swaggerEnabled && logger.log(`Swagger enabled on http://localhost:${port}/api`);
  });
};

bootstrap();
