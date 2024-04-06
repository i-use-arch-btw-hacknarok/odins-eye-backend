import { Test } from '@nestjs/testing';
import { DbService } from './db.service';

describe(DbService.name, () => {
  let service: DbService;

  beforeEach(async () => {
    const moduleRef = await Test.createTestingModule({
      providers: [DbService],
    }).compile();

    service = moduleRef.get<DbService>(DbService);
  });

  describe('onModuleInit', () => {
    it('should connect to the database', async () => {
      const connectSpy = jest.spyOn(service, '$connect').mockResolvedValue();

      await service.onModuleInit();

      expect(connectSpy).toHaveBeenCalled();
    });
  });
});
