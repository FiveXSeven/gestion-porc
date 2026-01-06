import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    try {
        console.log('Connecting...');
        await prisma.$connect();
        console.log('Connected!');
    } catch (e: any) {
        console.error('Connection failed name:', e.name);
        console.error('Connection failed message:', e.message);
        if (e.clientVersion) console.error('Client Version:', e.clientVersion);
    } finally {
        await prisma.$disconnect();
    }
}

main();
