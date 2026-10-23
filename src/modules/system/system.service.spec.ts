import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import { Test, TestingModule } from '@nestjs/testing';
import { SystemService } from './system.service.js';

describe('SystemService', () => {
    let service: SystemService;

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [SystemService],
        }).compile();

        service = module.get<SystemService>(SystemService);
    });

    afterEach(() => {
        // Réinitialise les variables d'environnement après chaque test
        vi.unstubAllEnvs();
    });

    it('doit être défini', () => {
        expect(service).toBeDefined();
    });

    describe('getReferenceData', () => {
        it("doit retourner l'ensemble des dictionnaires de données Prisma", () => {
            const result = service.getReferenceData();

            expect(result).toHaveProperty('roles');
            expect(result).toHaveProperty('niveauImpactIA');
            expect(result).toHaveProperty('categorieCompetence');
            expect(result).toHaveProperty('typeTache');
            expect(result).toHaveProperty('tendanceEmploi');
        });
    });

    describe('getSystemStatus', () => {
        it("doit retourner le statut avec les variables d'environnement actives", () => {
            vi.stubEnv('NODE_ENV', 'test');
            vi.stubEnv('VAULT_SECURED', 'true');
            vi.stubEnv('npm_package_version', '1.2.3');

            const result = service.getSystemStatus();

            expect(result.environment).toBe('test');
            expect(result.vaultSecured).toBe(true);
            expect(result.version).toBe('1.2.3');
            expect(result.timestamp).toBeDefined();

            // Vérifie la validité du format de la date
            expect(() => new Date(result.timestamp).toISOString()).not.toThrow();
        });

        it('doit appliquer les valeurs par défaut (fallback) si les variables sont absentes', () => {
            vi.stubEnv('NODE_ENV', '');
            vi.stubEnv('VAULT_SECURED', 'false');
            vi.stubEnv('npm_package_version', '');

            const result = service.getSystemStatus();

            expect(result.environment).toBe('development');
            expect(result.vaultSecured).toBe(false);
            expect(result.version).toBe('1.0.0');
        });
    });
});
