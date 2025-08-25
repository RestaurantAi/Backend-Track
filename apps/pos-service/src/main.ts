import { NestFactory } from '@nestjs/core';
import { PosServiceModule } from './pos-service.module';

async function bootstrap() {
  const app = await NestFactory.create(PosServiceModule);
  await app.listen(process.env.port ?? 3000);
}
bootstrap();
