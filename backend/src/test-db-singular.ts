import { PrismaClient } from '@prisma/client';

// @ts-ignore
const prisma = new PrismaClient({
    datasource: {
        url: process.env.DATABASE_URL,
    },
});

async function main() {
    await prisma.$connect();
    console.log('Connected!');
    await prisma.$disconnect();
}
main();
