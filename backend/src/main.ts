import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { AppModule } from './app.module';
import compression from 'compression';
import errorHandler from 'errorhandler';
import { urlencoded } from 'express';
import { ValidationPipe, VersioningType } from '@nestjs/common';
import passport from 'passport';
import { ExceptionHelper } from './Helper/Exception.helper';
import { CommonSeederService } from './Database/Seeds/CommonSeeder.service';
import { ConfigService } from '@nestjs/config';


async function bootstrap() {
  const app = await NestFactory.create(AppModule, { cors: { origin: "*", exposedHeaders: "*" } });
  app.setGlobalPrefix('api');
  app.enableVersioning({
    type: VersioningType.URI,
  });
  app.use(compression());
  app.use(errorHandler());
  app.use(urlencoded({ limit: '500mb', extended: true }));
  app.use(passport.initialize());
  // app.useGlobalPipes(new ValidationPipe({ transform: true, whitelist: true, forbidNonWhitelisted: true, forbidUnknownValues: true }));
  app.useGlobalPipes(new ValidationPipe({ transform: true }));
  app.useGlobalFilters(new ExceptionHelper());
  const config = new DocumentBuilder()
    .setTitle('Jewel Stock')
    .addBearerAuth()
    .setDescription('Jewel Stock API Description')
    .setVersion('1.0')
    .setExternalDoc('Postman Collection', '/swagger-json')
    .setContact("Jewel Stock", "https://Demo", "Demo@Demo")
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('swagger', app, document, { swaggerOptions: { tagsSorter: 'alpha', enableSearch: true } });
  const _ConfigService = app.get(ConfigService);
  await app.listen(_ConfigService.get("Port"));
  if (_ConfigService.get("Database.Seed") == "true") {
    const _CommonSeederService = app.get(CommonSeederService);
    await _CommonSeederService.Run();
  }
}
bootstrap();
