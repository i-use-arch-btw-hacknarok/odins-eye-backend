import { INestApplication } from '@nestjs/common';
import { SwaggerModule } from '@nestjs/swagger';
import { setupSwagger } from './swagger';

const documentMock = {};
const builderMock = {
  build: jest.fn(() => documentMock),
};
jest.mock('@nestjs/swagger', () => ({
  DocumentBuilder: jest.fn().mockImplementation(() => builderMock),
  SwaggerModule: {
    createDocument: jest.fn(),
    setup: jest.fn(),
  },
}));

describe('SwaggerSetup', () => {
  let app: INestApplication;

  beforeEach(() => {
    jest.clearAllMocks();
    app = {} as INestApplication;
    setupSwagger(app);
  });

  it('should call DocumentBuilder.build', () => {
    expect(builderMock.build).toHaveBeenCalled();
  });

  it('should call SwaggerModule.createDocument', () => {
    expect(SwaggerModule.createDocument).toHaveBeenCalledWith(app, documentMock);
  });

  it('should call SwaggerModule.setup', () => {
    expect(SwaggerModule.setup).toHaveBeenCalledWith('api', app, undefined);
  });
});
