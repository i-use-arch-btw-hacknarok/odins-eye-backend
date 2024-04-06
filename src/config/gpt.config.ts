import { ConfigType, registerAs } from '@nestjs/config';
import { requiredEnv } from './helpers/requiredEnv';

export const GPT_CONFIG_KEY = 'GPT_CONFIG_KEY';

export const gptConfig = registerAs(GPT_CONFIG_KEY, () => ({
  apiKey: requiredEnv('OPENAI_API_KEY'),
}));

export type GptConfig = ConfigType<typeof gptConfig>;
