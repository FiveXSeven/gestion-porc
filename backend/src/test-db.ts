import { PrismaClient } from '@prisma/client';

// @ts-ignore
const prisma = new PrismaClient({
    datasources: {
        db: {
            url: process.env.DATABASE_URL,
        },
    },
});

async function main() {
    try {
        console.log('Attempting to connect with URL:', process.env.DATABASE_URL);
        await prisma.$connect();
        console.log('Successfully connected to database!');
        const count = await prisma.truie.count();
        console.log('Truie count:', count);
    } catch (error) {
        console.error('Connection failed:', error);
    } finally {
        await prisma.$disconnect();
    }
}

main();
