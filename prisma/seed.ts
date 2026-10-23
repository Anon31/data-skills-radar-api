import { PrismaClient, Role } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import * as bcrypt from 'bcrypt';
import pg from 'pg';

// Extraction de Pool depuis le module pg (compatible ESM)
const { Pool } = pg;

// 1. Initialisation de la connexion native PostgreSQL
const connectionString = process.env.DATABASE_URL;
const pool = new Pool({ connectionString });

// 2. Injection dans l'adaptateur Prisma 7
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
    console.log('🌱 Début du seeding de la base de données...');

    // Nettoyage des tables existantes
    await prisma.address.deleteMany();
    await prisma.user.deleteMany();

    const salt = await bcrypt.genSalt(10);

    // Utilisateur ADMIN
    const hashAdmin = await bcrypt.hash('admin123!', salt);
    await prisma.user.create({
        data: {
            email: 'admin@dataskillsradar.com',
            password: hashAdmin,
            firstname: 'Thomas',
            lastname: 'Noël',
            phone: '+33600000001',
            birthdate: new Date('1979-02-15T00:00:00Z'),
            enabled: true,
            role: Role.ADMIN,
            address: {
                create: {
                    number: '15',
                    street: 'Rue de la République',
                    city: 'Puylaurens',
                    postalCode: '81700',
                    country: 'France',
                },
            },
        },
    });

    // Utilisateur USER
    const hashUser = await bcrypt.hash('user123!', salt);
    await prisma.user.create({
        data: {
            email: 'user@dataskillsradar.com',
            password: hashUser,
            firstname: 'Alice',
            lastname: 'Décideur',
            phone: '+33680265126',
            birthdate: new Date('1990-06-22T00:00:00Z'),
            enabled: true,
            role: Role.USER,
            address: {
                create: {
                    number: '265',
                    street: 'Rue de la paix',
                    city: 'Puylaurens',
                    postalCode: '81700',
                    country: 'France',
                },
            },
        },
    });

    // Utilisateur VISITOR
    const hashVisitor = await bcrypt.hash('visitor123!', salt);
    await prisma.user.create({
        data: {
            email: 'visitor@dataskillsradar.com',
            password: hashVisitor,
            firstname: 'Bob',
            lastname: 'Curieux',
            phone: '+33680265127',
            birthdate: new Date('2001-11-05T00:00:00Z'),
            enabled: true,
            role: Role.VISITOR,
            address: {
                create: {
                    number: '13',
                    street: 'Place du prado',
                    city: 'Marseille',
                    postalCode: '13007',
                    country: 'France',
                },
            },
        },
    });

    console.log('✅ Utilisateurs créés avec succès (Admin, User, Visitor).');
}

try {
    await main();
} catch (e) {
    console.error('❌ Erreur lors du seed :', e);
    process.exit(1);
} finally {
    // Fermeture propre des connexions
    await prisma.$disconnect();
    await pool.end();
    console.log('🔌 Fin du script de seed.');
}