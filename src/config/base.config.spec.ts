import { baseConfig } from './base.config';

describe(baseConfig.KEY, () => {
  const resetEnv = () => {
    delete process.env.PORT;
    delete process.env.NODE_ENV;
    delete process.env.APPLICATION_DOMAIN;
  };

  const setupEnv = () => {
    process.env.JWT_SECRET = 'mockSecret';
    process.env.APPLICATION_DOMAIN = 'http://localhost:3000';
  };

  afterEach(() => {
    resetEnv();
  });

  beforeEach(() => {
    setupEnv();
  });

  describe('port', () => {
    it('should return the default port if process.env.PORT is not set', () => {
      const { port } = baseConfig();
      expect(port).toEqual(3000);
    });

    it('should return the port from process.env.PORT if set', () => {
      process.env.PORT = '4000';
      const { port } = baseConfig();
      expect(port).toEqual(4000);
    });
  });

  describe('swaggerEnabled', () => {
    it('should return true if process.env.NODE_ENV is not "production"', () => {
      process.env.NODE_ENV = 'development';
      const { swaggerEnabled } = baseConfig();
      expect(swaggerEnabled).toBeTruthy();
    });

    it('should return false if process.env.NODE_ENV is "production"', () => {
      process.env.NODE_ENV = 'production';
      const { swaggerEnabled } = baseConfig();
      expect(swaggerEnabled).toBeFalsy();
    });
  });

  describe('jwtSecret', () => {
    it('should throw error if process.env.JWT_SECRET is not set', () => {
      delete process.env.JWT_SECRET;
      expect(() => baseConfig()).toThrow();
    });

    it('should return the JWT_SECRET from process.env.JWT_SECRET if set', () => {
      process.env.JWT_SECRET = 'mySecretToken';
      const { jwtSecret } = baseConfig();
      expect(jwtSecret).toEqual('mySecretToken');
    });
  });

  describe('applicationDomain', () => {
    it('should throw error if process.env.APPLICATION_DOMAIN is not set', () => {
      delete process.env.APPLICATION_DOMAIN;
      expect(() => baseConfig()).toThrow();
    });

    it('should return the APPLICATION_DOMAIN from process.env.APPLICATION_DOMAIN if set', () => {
      const { applicationDomain } = baseConfig();
      expect(applicationDomain).toEqual('http://localhost:3000');
    });
  });
});
