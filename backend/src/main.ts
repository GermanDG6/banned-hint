import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { DomainExceptionFilter } from './shared/infrastructure/filters/domain-exception.filter';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.enableCors();
  app.setGlobalPrefix('api');
  app.useGlobalFilters(new DomainExceptionFilter());

  const port = process.env.PORT ?? 3000;
  await app.listen(port);

  console.log(`Application running on: http://localhost:${port}/api`);
}

bootstrap();
