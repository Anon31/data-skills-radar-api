import { PrismaService } from './prisma.service.js';
import { Global, Module } from '@nestjs/common';

@Global() // Permet de rendre le PrismaService disponible partout sans avoir à l'importer dans chaque module
@Module({
    providers: [PrismaService],
    exports: [PrismaService],
})
export class PrismaModule {}
