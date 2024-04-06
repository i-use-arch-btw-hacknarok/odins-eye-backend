import { Injectable } from '@nestjs/common';
import { randomBytes } from 'crypto';

@Injectable()
export class RandomnessUtils {
  randomUrlSafeString(length = 32): string {
    return randomBytes(length)
      .toString('base64')
      .replace(/\+/g, '-')
      .replace(/\//g, '_')
      .replace(/=/g, '')
      .slice(0, length);
  }
}
