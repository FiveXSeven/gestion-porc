import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
    // Wipe existing users
    await prisma.user.deleteMany();

    // Create test users
    const user1 = await prisma.user.create({
        data: {
            email: 'admin@gestion-porc.local',
            pin: await bcrypt.hash('1234', 10),
            name: 'Admin User'
        }
    });

    const user2 = await prisma.user.create({
        data: {
            email: 'user@gestion-porc.local',
            pin: await bcrypt.hash('5678', 10),
            name: 'Test User'
        }
    });

    console.log('✓ Database seeded with test users:');
    console.log(`  - ${user1.email} (PIN: 1234)`);
    console.log(`  - ${user2.email} (PIN: 5678)`);
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
