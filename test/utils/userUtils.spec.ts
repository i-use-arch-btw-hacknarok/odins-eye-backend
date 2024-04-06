import { INestApplication } from '@nestjs/common';
import { TestingModule, Test } from '@nestjs/testing';
import { AppModule } from '@src/app.module';
import { MailgunMockService } from '@test/mocks/mailgun-mock.service';
import { createUser } from '@test/utils/userUtils';
import { MailgunService } from 'nestjs-mailgun';

describe('createUser helper', () => {
  let app: INestApplication;

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    })
      .overrideProvider(MailgunService)
      .useValue(new MailgunMockService())
      .compile();
    app = moduleFixture.createNestApplication();

    await app.init();
  });

  it('should create a user', async () => {
    const email = 'create-user-test-1@localhost.local';
    const password = 'UltraSecretPassword123!';

    const { getAuthToken } = await createUser(app)(email, password);

    const authToken = await getAuthToken();

    expect(authToken).toBeDefined();
    expect(typeof authToken).toBe('string');
    expect(authToken.length).toBeGreaterThan(0);
  });
});
