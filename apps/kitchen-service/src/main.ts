import { NestFactory } from '@nestjs/core';
import { KitchenServiceModule } from './kitchen-service.module';

async function bootstrap() {
  const app = await NestFactory.create(KitchenServiceModule);
  await app.listen(process.env.port ?? 3000);
}
bootstrap();
