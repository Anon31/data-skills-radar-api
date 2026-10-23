import { DeepMockProxy, mockDeep } from 'jest-mock-extended';
import { PrismaService } from '../prisma/prisma.service.js';

// Exporte un type pratique pour les tests
export type MockPrismaService = DeepMockProxy<PrismaService>;

// Exporte une fonction qui retourne le Provider NestJS prêt à l'emploi
export const providePrismaMock = () => ({
    provide: PrismaService,
    useValue: mockDeep<PrismaService>(),
});
