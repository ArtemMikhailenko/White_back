import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { Logger } from '@nestjs/common';

async function bootstrap() {
  const logger = new Logger('Bootstrap');
  const app = await NestFactory.create(AppModule);
  
  // Включаем CORS
  app.enableCors({
    origin: '*', // В продакшене замените на конкретные домены
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    credentials: true,
  });
  
  // Render ожидает, что приложение будет прослушивать порт из переменной окружения PORT
  const port = process.env.PORT || 3000;
  
  await app.listen(port, '0.0.0.0', () => {
    logger.log(`Application listening on port ${port}`);
  });
}
bootstrap();