import { ConfigType, registerAs } from '@nestjs/config';
import { requiredEnv } from './helpers/requiredEnv';

export const AWS_CONFIG_KEY = 'AWS_CONFIG_KEY';

export const awsConfig = registerAs(AWS_CONFIG_KEY, () => ({
  bucketName: requiredEnv('AWS_BUCKET_NAME'),
  region: requiredEnv('AWS_REGION'),
  accessKeyId: requiredEnv('AWS_ACCESS_KEY_ID'),
  secretAccessKey: requiredEnv('AWS_SECRET_ACCESS_KEY'),
}));

export type AwsConfig = ConfigType<typeof awsConfig>;
