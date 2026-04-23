import { NestFactory, Reflector } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { AppModule } from './app.module';
import { JwtAuthGuard } from './common/guards/jwt-auth.guard';
import { AuditInterceptor } from './common/interceptors/audit.interceptor';
import { AuditService } from './audit/audit.service';

async function bootstrap(): Promise<void> {
  const app = await NestFactory.create(AppModule);

  app.enableCors({
    origin: true,
    credentials: true,
  });

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      forbidNonWhitelisted: true,
    }),
  );

  const reflector = app.get(Reflector);
  app.useGlobalGuards(new JwtAuthGuard(reflector));

  const auditService = app.get(AuditService);
  app.useGlobalInterceptors(new AuditInterceptor(auditService));

  const config = new DocumentBuilder()
    .setTitle('Football Recruit Platform API')
    .setDescription('API for the football recruitment marketplace.')
    .setVersion('0.1.0')
    .addBearerAuth()
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, document);

  const port = Number(process.env.PORT ?? 3001);
  await app.listen(port);

  // eslint-disable-next-line no-console
  console.log(`Backend listening on http://0.0.0.0:${port}`);
}

void bootstrap();
