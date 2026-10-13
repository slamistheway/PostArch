import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import {LogLevel} from "@nestjs/common";

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    logger: ['log', 'error', 'warn', 'debug', 'verbose'] as LogLevel[],
  });

  app.enableCors({
    origin: ['http://localhost:8081'],
    credentials: true,
  });

  await app.listen(process.env.PORT ?? 3001, '0.0.0.0');
}
bootstrap();

