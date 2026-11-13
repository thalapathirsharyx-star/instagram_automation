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

import { ExpressAdapter } from '@nestjs/platform-express';
const express = require('express');

async function bootstrap() {
  const app = await NestFactory.create(AppModule, { 
    rawBody: true,
    cors: { 
      origin: (origin, callback) => {
        if (!origin) return callback(null, true);
        const allowedOrigins = [
          "http://localhost:5173",
          "https://localhost:5173",
          "http://localhost:8000",
          "https://flazly.in",
          "https://app.flazly.in",
          "https://flazly.com",
          "https://app.flazly.com",
          "https://www.flazly.com"
        ];
        const isLocalhost = /^https?:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/.test(origin);
        const isAllowed = isLocalhost || allowedOrigins.includes(origin) || origin.endsWith('.vercel.app');
        if (isAllowed) {
          callback(null, true);
        } else {
          callback(new Error('Not allowed by CORS'));
        }
      },
      credentials: true, 
      exposedHeaders: "*" 
    } 
  });
  app.setGlobalPrefix('api');
  app.enableVersioning({
    type: VersioningType.URI,
  });
  app.use(compression());
  app.use(errorHandler());
  app.use(urlencoded({ limit: '500mb', extended: true }));
  app.use(passport.initialize());
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
  
  const port = parseInt(process.env.PORT) || 8001;
  await app.listen(port, '0.0.0.0', () => {
    console.log(`[NestApplication] Server listening on port ${port}`);
  });

  if (_ConfigService.get("Database.Seed") == "true") {
    const _CommonSeederService = app.get(CommonSeederService);
    await _CommonSeederService.Run();
  }
}
bootstrap();
