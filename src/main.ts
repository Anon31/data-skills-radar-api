import { PrismaClientExceptionFilter } from './core/filters/prisma-client-exception.filter.js';
import { ValidationPipe, Logger, ClassSerializerInterceptor } from '@nestjs/common';
import { NestFactory, Reflector, HttpAdapterHost } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { AppModule } from './app.module.js';
import vault from 'node-vault';

async function fetchVaultSecrets() {
    if (!process.env.VAULT_ADDR || !process.env.ROLE_ID) {
        Logger.warn('[Vault] Identifiants non définis. Utilisation du .env local (Mode Dégradé/Dev).', 'Bootstrap');
        return;
    }

    const environment = process.env.NODE_ENV || 'development';
    Logger.log(`[Vault] Authentification AppRole en cours pour l'environnement : ${environment}...`, 'Bootstrap');

    const vaultClient = vault({
        apiVersion: 'v1',
        endpoint: process.env.VAULT_ADDR,
    });

    try {
        const result = await vaultClient.approleLogin({
            role_id: process.env.ROLE_ID,
            secret_id: process.env.SECRET_ID,
        });

        vaultClient.token = result.auth.client_token;

        // Mise à jour du chemin Vault pour le projet Data Skills Radar
        const secretPath = `secret/data/dataskillsradar/${environment}/backend`;
        Logger.log(`[Vault] Récupération des secrets depuis le chemin logique : ${secretPath}`, 'Bootstrap');

        const { data } = await vaultClient.read(secretPath);
        const secrets = data.data;

        if (secrets.DATABASE_URL) process.env.DATABASE_URL = secrets.DATABASE_URL;
        if (secrets.POSTGRES_PASSWORD) process.env.POSTGRES_PASSWORD = secrets.POSTGRES_PASSWORD;
        if (secrets.JWT_SECRET) process.env.JWT_SECRET = secrets.JWT_SECRET;

        process.env.VAULT_SECURED = 'true';
        Logger.log('[Vault] 🔐 Secrets chargés et injectés avec succès en mémoire.', 'Bootstrap');
    } catch (error) {
        const err = error as Error;
        Logger.error(`[Vault] Erreur critique (Env: ${environment}): ${err.message}`, 'Bootstrap');
        process.exit(1);
    }
}

async function bootstrap() {
    await fetchVaultSecrets();

    const app = await NestFactory.create(AppModule);
    const globalPrefix = 'api/v1';

    app.setGlobalPrefix(globalPrefix);

    app.useGlobalPipes(
        new ValidationPipe({
            whitelist: true,
            transform: true,
            forbidNonWhitelisted: true,
        }),
    );

    app.useGlobalInterceptors(new ClassSerializerInterceptor(app.get(Reflector)));

    const { httpAdapter } = app.get(HttpAdapterHost);
    app.useGlobalFilters(new PrismaClientExceptionFilter(httpAdapter));

    app.enableCors();

    // Mise à jour de la configuration Swagger
    const config = new DocumentBuilder()
        .setTitle('Data Skills Radar API')
        .setDescription("Documentation de l'API analytique et prédictive de la mutation des compétences face à l'IA")
        .setVersion('1.0')
        .addBearerAuth()
        .build();

    const document = SwaggerModule.createDocument(app, config);
    SwaggerModule.setup('api', app, document);

    const port = process.env.PORT || 3000;
    await app.listen(port, '0.0.0.0');

    Logger.log(`🚀 Application is running on: http://localhost:${port}/${globalPrefix}`);
    Logger.log(`📑 Swagger Docs: http://localhost:${port}/api`);
}

await bootstrap().catch((err) => {
    console.error("Erreur lors du démarrage de l'application :", err);
});
