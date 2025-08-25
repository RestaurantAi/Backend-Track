import { NestFactory } from '@nestjs/core';
import { ProcurementServiceModule } from './procurement-service.module';

async function bootstrap() {
  const app = await NestFactory.create(ProcurementServiceModule);
  await app.listen(process.env.port ?? 3000);
}
bootstrap();
