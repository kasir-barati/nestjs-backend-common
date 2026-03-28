import { INestApplication } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

import { createSwaggerConfiguration } from './create-swagger-configuration.util';

jest.mock('@nestjs/swagger', () => {
  const mockDocumentBuilder = {
    setTitle: jest.fn().mockReturnThis(),
    setDescription: jest.fn().mockReturnThis(),
    addServer: jest.fn().mockReturnThis(),
    build: jest.fn().mockReturnValue({ info: { title: 'mock' } }),
  };

  return {
    DocumentBuilder: jest.fn(() => mockDocumentBuilder),
    SwaggerModule: {
      createDocument: jest
        .fn()
        .mockReturnValue({ paths: {}, info: { title: 'mock' } }),
      setup: jest.fn(),
    },
  };
});

describe(createSwaggerConfiguration.name, () => {
  let mockApp: INestApplication;

  beforeEach(() => {
    jest.clearAllMocks();
    mockApp = {} as INestApplication;
  });

  it('should create swagger document with correct title and description', () => {
    createSwaggerConfiguration({
      app: mockApp,
      title: 'My API',
      appUrl: 'http://localhost:3000',
      swaggerPath: '/docs',
      description: 'API description',
    });

    const builderInstance =
      jest.mocked(DocumentBuilder).mock.results[0].value;

    expect(builderInstance.setTitle).toHaveBeenCalledWith('My API');
    expect(builderInstance.setDescription).toHaveBeenCalledWith(
      'API description',
    );
  });

  it('should call SwaggerModule.createDocument with the app and built document', () => {
    createSwaggerConfiguration({
      app: mockApp,
      title: 'Test',
      appUrl: 'http://localhost:3000',
      swaggerPath: '/docs',
      description: 'desc',
    });

    const builderInstance =
      jest.mocked(DocumentBuilder).mock.results[0].value;
    const builtDocument = builderInstance.build.mock.results[0].value;

    expect(SwaggerModule.createDocument).toHaveBeenCalledWith(
      mockApp,
      builtDocument,
    );
  });

  it('should call SwaggerModule.setup with the swagger path, app, and document', () => {
    createSwaggerConfiguration({
      app: mockApp,
      title: 'Test',
      appUrl: 'http://localhost:3000',
      swaggerPath: '/api-docs',
      description: 'desc',
    });

    const swaggerDocument = jest.mocked(SwaggerModule.createDocument)
      .mock.results[0].value;

    expect(SwaggerModule.setup).toHaveBeenCalledWith(
      '/api-docs',
      mockApp,
      swaggerDocument,
    );
  });

  it('should return the swagger document', () => {
    const result = createSwaggerConfiguration({
      app: mockApp,
      title: 'Test',
      appUrl: 'http://localhost:3000',
      swaggerPath: '/docs',
      description: 'desc',
    });

    expect(result).toEqual(
      jest.mocked(SwaggerModule.createDocument).mock.results[0].value,
    );
  });

  describe('URL normalization', () => {
    it('should remove trailing slash from URL', () => {
      createSwaggerConfiguration({
        app: mockApp,
        title: 'Test',
        appUrl: 'http://localhost:3000/',
        swaggerPath: '/docs',
        description: 'desc',
      });

      const builderInstance =
        jest.mocked(DocumentBuilder).mock.results[0].value;

      expect(builderInstance.addServer).toHaveBeenCalledWith(
        'http://localhost:3000',
      );
    });

    it('should keep URL without trailing slash unchanged', () => {
      createSwaggerConfiguration({
        app: mockApp,
        title: 'Test',
        appUrl: 'http://localhost:3000',
        swaggerPath: '/docs',
        description: 'desc',
      });

      const builderInstance =
        jest.mocked(DocumentBuilder).mock.results[0].value;

      expect(builderInstance.addServer).toHaveBeenCalledWith(
        'http://localhost:3000',
      );
    });

    it('should add http:// protocol for localhost URL without protocol', () => {
      createSwaggerConfiguration({
        app: mockApp,
        title: 'Test',
        appUrl: 'localhost:3000',
        swaggerPath: '/docs',
        description: 'desc',
      });

      const builderInstance =
        jest.mocked(DocumentBuilder).mock.results[0].value;

      expect(builderInstance.addServer).toHaveBeenCalledWith(
        'http://localhost:3000',
      );
    });

    it('should add http:// protocol for 127.0.0.1 URL without protocol', () => {
      createSwaggerConfiguration({
        app: mockApp,
        title: 'Test',
        appUrl: '127.0.0.1:3000',
        swaggerPath: '/docs',
        description: 'desc',
      });

      const builderInstance =
        jest.mocked(DocumentBuilder).mock.results[0].value;

      expect(builderInstance.addServer).toHaveBeenCalledWith(
        'http://127.0.0.1:3000',
      );
    });

    it('should add http:// protocol for 0.0.0.0 URL without protocol', () => {
      createSwaggerConfiguration({
        app: mockApp,
        title: 'Test',
        appUrl: '0.0.0.0:3000',
        swaggerPath: '/docs',
        description: 'desc',
      });

      const builderInstance =
        jest.mocked(DocumentBuilder).mock.results[0].value;

      expect(builderInstance.addServer).toHaveBeenCalledWith(
        'http://0.0.0.0:3000',
      );
    });

    it('should add https:// protocol for non-localhost URL without protocol', () => {
      createSwaggerConfiguration({
        app: mockApp,
        title: 'Test',
        appUrl: 'myapp.com',
        swaggerPath: '/docs',
        description: 'desc',
      });

      const builderInstance =
        jest.mocked(DocumentBuilder).mock.results[0].value;

      expect(builderInstance.addServer).toHaveBeenCalledWith(
        'https://myapp.com',
      );
    });

    it('should add https:// protocol for non-localhost URL with trailing slash', () => {
      createSwaggerConfiguration({
        app: mockApp,
        title: 'Test',
        appUrl: 'api.example.com/',
        swaggerPath: '/docs',
        description: 'desc',
      });

      const builderInstance =
        jest.mocked(DocumentBuilder).mock.results[0].value;

      expect(builderInstance.addServer).toHaveBeenCalledWith(
        'https://api.example.com',
      );
    });

    it('should not add protocol when http:// is already present', () => {
      createSwaggerConfiguration({
        app: mockApp,
        title: 'Test',
        appUrl: 'http://myapp.com',
        swaggerPath: '/docs',
        description: 'desc',
      });

      const builderInstance =
        jest.mocked(DocumentBuilder).mock.results[0].value;

      expect(builderInstance.addServer).toHaveBeenCalledWith(
        'http://myapp.com',
      );
    });

    it('should not add protocol when https:// is already present', () => {
      createSwaggerConfiguration({
        app: mockApp,
        title: 'Test',
        appUrl: 'https://myapp.com',
        swaggerPath: '/docs',
        description: 'desc',
      });

      const builderInstance =
        jest.mocked(DocumentBuilder).mock.results[0].value;

      expect(builderInstance.addServer).toHaveBeenCalledWith(
        'https://myapp.com',
      );
    });

    it('should handle https:// URL with trailing slash', () => {
      createSwaggerConfiguration({
        app: mockApp,
        title: 'Test',
        appUrl: 'https://myapp.com/',
        swaggerPath: '/docs',
        description: 'desc',
      });

      const builderInstance =
        jest.mocked(DocumentBuilder).mock.results[0].value;

      expect(builderInstance.addServer).toHaveBeenCalledWith(
        'https://myapp.com',
      );
    });

    it('should preserve existing http:// for localhost URLs', () => {
      createSwaggerConfiguration({
        app: mockApp,
        title: 'Test',
        appUrl: 'http://localhost:8080/',
        swaggerPath: '/docs',
        description: 'desc',
      });

      const builderInstance =
        jest.mocked(DocumentBuilder).mock.results[0].value;

      expect(builderInstance.addServer).toHaveBeenCalledWith(
        'http://localhost:8080',
      );
    });
  });
});
