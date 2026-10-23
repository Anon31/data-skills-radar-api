import { Role, NiveauImpactIA, CategorieCompetence, TypeTache, TendanceEmploi } from '@prisma/client';
import { Injectable } from '@nestjs/common';

@Injectable()
export class SystemService {
    getReferenceData() {
        return {
            roles: Role,
            niveauImpactIA: NiveauImpactIA,
            categorieCompetence: CategorieCompetence,
            typeTache: TypeTache,
            tendanceEmploi: TendanceEmploi,
        };
    }

    getSystemStatus() {
        return {
            environment: process.env.NODE_ENV || 'development',
            vaultSecured: process.env.VAULT_SECURED === 'true',
            version: process.env.npm_package_version || '1.0.0',
            timestamp: new Date().toISOString(),
        };
    }
}
