import { NestFactory } from '@nestjs/core';
import { NestExpressApplication } from '@nestjs/platform-express';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { join } from 'path';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);
  app.enableCors();

  // const config = new DocumentBuilder()
  //   .setTitle('Swagger UI')
  //   .setDescription('The Demo Nest API')
  //   .setVersion('1.0')
  //   .addTag('user')
  //   .addTag('category')
  //   .addTag('news')
  //   .addTag('call')
  //   .addTag('sync')
  //   .addBearerAuth(
  //     { type: 'http', scheme: 'bearer', bearerFormat: 'JWT' },
  //     'auth',
  //   )
  //   .build();

  // const document = SwaggerModule.createDocument(app, config);
  // SwaggerModule.setup('swagger', app, document);

  await app.listen(3000);
}

bootstrap();
