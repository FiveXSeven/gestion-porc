import { PrismaClient } from '@prisma/client';
import { execSync } from 'child_process';

const prisma = new PrismaClient({
    datasources: {
        db: {
            url: 'file:./test-integration.db',
        },
    },
});

export const setupTestDb = async () => {
    // Run migrations
    process.env.DATABASE_URL = 'file:./test-integration.db';
    try {
        execSync('npx prisma db push --skip-generate --accept-data-loss', {
            stdio: 'inherit',
            env: { ...process.env, DATABASE_URL: 'file:./test-integration.db' }
        });
    } catch (e) {
        console.error("Failed to push db", e);
        throw e;
    }
    return prisma;
};

export const teardownTestDb = async () => {
    // Clean up data
    // Use transaction to delete in correct order (child first)
    // Note: We use deleteMany() which is supported on all models

    const deleteOperations = [
        prisma.pesee.deleteMany(),
        prisma.lotEngraissement.deleteMany(),
        prisma.lotPostSevrage.deleteMany(),
        prisma.alert.deleteMany(),
        prisma.depense.deleteMany(),
        prisma.vente.deleteMany(),
        prisma.portee.deleteMany(),
        prisma.miseBas.deleteMany(),
        prisma.saillie.deleteMany(),
        prisma.truie.deleteMany(),
        prisma.stockAliment.deleteMany(),
    ];

    await prisma.$transaction(deleteOperations);

    await prisma.$disconnect();
};

export default prisma;
