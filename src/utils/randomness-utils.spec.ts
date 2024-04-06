import { Test, TestingModule } from '@nestjs/testing';
import { RandomnessUtils } from './randomness-utils.service';

describe(RandomnessUtils, () => {
  let service: RandomnessUtils;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [RandomnessUtils],
    }).compile();

    service = module.get<RandomnessUtils>(RandomnessUtils);
  });

  describe('randomUrlSafeString', () => {
    it('should return a string of given length', () => {
      const lengths = [1, 10, 32, 64];

      for (const length of lengths) {
        const randomString = service.randomUrlSafeString(length);
        expect(randomString).toHaveLength(length);
      }
    });

    it('should return a string with only url safe characters', () => {
      const randomString = service.randomUrlSafeString(1000);
      const urlSafeCharacters = /^[a-zA-Z0-9_-]+$/;
      expect(randomString).toMatch(urlSafeCharacters);
    });

    it('should by default return a string of length 32', () => {
      const randomString = service.randomUrlSafeString();
      expect(randomString).toHaveLength(32);
    });
  });
});
