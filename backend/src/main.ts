import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { json, urlencoded } from 'express';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.use(json({ limit: '50mb' }));
  app.use(urlencoded({ extended: true, limit: '50mb' }));

  // Middleware para loggear todas las peticiones
  app.use((req, res, next) => {
    console.log('====================================');
    console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
    console.log('Headers:', req.headers);
    console.log('Body:', req.body);
    console.log('====================================');
    next();
  });

  app.enableCors({
    origin: (origin, callback) => {
      // Permitir requests sin 'origin' (ej: desde apps móviles nativas con Capacitor)
      if (!origin) return callback(null, true);

      const allowedOrigins = [
        'https://bolt.new',
<<<<<<< HEAD
        'http://localhost:5174',
=======
>>>>>>> da8fe5ae1dee89831221a9c3bb29c9b166d24852
        'http://localhost:5175',
        'http://localhost',
        'http://localhost:3030',
        'http://localhost:8443',
<<<<<<< HEAD
        'http://108.181.193.178:5174',
        'http://108.181.193.178:5175',
        'http://2.50.80.90:5174',
        'http://2.50.80.90:5175',
        'http://2.58.80.90:5174',
        'http://2.58.80.90:5175',
        'http://108.181.193.178:443',
        'http://108.181.193.178',
        'http://108.181.193.178:3030',
        'http://2.50.80.90:3030',
=======
        'http://108.181.193.178:5175',
        'http://2.58.80.90:5175',
        'http://108.181.193.178:443',
        'http://108.181.193.178',
        'http://108.181.193.178:3006',
>>>>>>> da8fe5ae1dee89831221a9c3bb29c9b166d24852
        'http://2.58.80.90:3030',

        'capacitor://localhost',
        'capacitor://108.181.193.178',
<<<<<<< HEAD
        'capacitor://2.50.80.90',
        'capacitor://2.58.80.90',
        'capacitor://',   // 👈 agregar este
        null,             // 👈 permitir requests sin origin
        'https://zp1v56uxy8rdx5ypatb0ockcb9tr6a-oci3--5174--4d9fd228.local-credentialless.webcontainer-api.io/',
=======
        'capacitor://2.58.80.90',
        'https://zp1v56uxy8rdx5ypatb0ockcb9tr6a-oci3--5175--4d9fd228.local-credentialless.webcontainer-api.io/',
>>>>>>> da8fe5ae1dee89831221a9c3bb29c9b166d24852
      ];

      // Verificación extendida
      if (
        allowedOrigins.includes(origin) ||
        origin.startsWith('capacitor://') || // Permitir cualquier origen Capacitor
        origin.startsWith('http://localhost') // Permitir localhost (dev)
      ) {
        callback(null, true);
      } else {
        console.warn(`[CORS] 🚫 Bloqueado origen: ${origin}`);
        callback(new Error(`CORS bloqueado para origen: ${origin}`));
      }
    },
    methods: ['GET', 'HEAD', 'PUT', 'PATCH', 'POST', 'DELETE', 'OPTIONS'],
    allowedHeaders: [
      'Content-Type',
      'Authorization',
      'Accept',
      'Cache-Control',
    ],
    credentials: true,
    optionsSuccessStatus: 200,
  });
  const config = new DocumentBuilder()
    .setTitle('API de Facturación')
    .setDescription('Documentación de la API')
    .setVersion('1.0')
    .addBearerAuth()
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, document);

  // 🖥️ Puerto dinámico
  const port = process.env.PORT || 3030;
  await app.listen(port);
  console.log(`🚀 API corriendo en http://localhost:${port}`);
}
bootstrap();

