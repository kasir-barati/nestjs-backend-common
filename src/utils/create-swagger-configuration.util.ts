import { INestApplication } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

export interface CreateSwaggerConfiguration {
  app: INestApplication;
  /**
   * @description Usually you want to pick the service name.
   */
  title: string;
  /**
   * @description The URL of the application.
   * @example http://localhost:3000 or https://myapp.com
   */
  appUrl: string;
  /**
   * @description The path where the Swagger documentation will be available.
   * @example /docs
   */
  swaggerPath: string;
  /**
   * @description A brief description of the API.
   */
  description: string;
}

export function createSwaggerConfiguration({
  app,
  title,
  appUrl,
  swaggerPath,
  description,
}: CreateSwaggerConfiguration) {
  const normalizedUrl = normalizeUrl(appUrl);
  const documentBuilder = new DocumentBuilder()
    .setTitle(title)
    .setDescription(description)
    .addServer(normalizedUrl)
    .build();
  const swaggerDocument = SwaggerModule.createDocument(
    app,
    documentBuilder,
  );

  SwaggerModule.setup(swaggerPath, app, swaggerDocument);

  return swaggerDocument;
}

/**
 * @description Removes the trailing / if there is one and add protocol considering whether it is localhost or not.
 */
function normalizeUrl(url: string) {
  const httpRegex = /^(http|https):\/\//;

  if (!httpRegex.test(url)) {
    const protocol = /(localhost|127\.0\.0\.1|0\.0\.0\.0)/.test(url)
      ? 'http://'
      : 'https://';
    url = protocol + url;
  }
  if (url.endsWith('/')) {
    url = url.slice(0, -1);
  }

  return url;
}
