import prisma from '../prisma';

// Generate alerts for upcoming mise bas (7 days before expected date)
export async function generateMiseBasAlerts(): Promise<number> {
    const today = new Date();
    const sevenDaysFromNow = new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000);
    
    // Find saillies with expected mise bas in the next 7 days that are 'en_cours' or 'confirmee'
    const upcomingSaillies = await prisma.saillie.findMany({
        where: {
            statut: { in: ['en_cours', 'confirmee'] },
            datePrevueMiseBas: {
                gte: today,
                lte: sevenDaysFromNow,
            },
        },
        include: {
            truie: true,
        },
    });

    let createdCount = 0;
    for (const saillie of upcomingSaillies) {
        // Check if alert already exists for this saillie
        const existingAlert = await prisma.alert.findFirst({
            where: {
                type: 'mise_bas',
                relatedId: saillie.id,
                read: false,
            },
        });

        if (!existingAlert) {
            const daysUntil = Math.ceil((new Date(saillie.datePrevueMiseBas).getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
            await prisma.alert.create({
                data: {
                    type: 'mise_bas',
                    message: `Mise bas prévue pour ${saillie.truie.identification} dans ${daysUntil} jour(s)`,
                    date: new Date(),
                    read: false,
                    relatedId: saillie.id,
                },
            });
            createdCount++;
        }
    }
    return createdCount;
}

// Check if any post-sevrage lot has reached target weight
export async function checkPoidsCiblePostSevrage(): Promise<number> {
    const lotsEnCours = await prisma.lotPostSevrage.findMany({
        where: {
            statut: 'en_cours',
        },
    });

    let createdCount = 0;
    for (const lot of lotsEnCours) {
        // Get the latest weighing for this lot
        const latestPesee = await prisma.pesee.findFirst({
            where: {
                lotPostSevrageId: lot.id,
            },
            orderBy: {
                date: 'desc',
            },
        });

        if (latestPesee && latestPesee.poidsMoyen >= lot.poidsCible) {
            // Check if alert already exists
            const existingAlert = await prisma.alert.findFirst({
                where: {
                    type: 'post_sevrage_pret',
                    relatedId: lot.id,
                    read: false,
                },
            });

            if (!existingAlert) {
                await prisma.alert.create({
                    data: {
                        type: 'post_sevrage_pret',
                        message: `Lot ${lot.identification} a atteint le poids cible (${latestPesee.poidsMoyen}/${lot.poidsCible} kg)`,
                        date: new Date(),
                        read: false,
                        relatedId: lot.id,
                    },
                });
                createdCount++;
            }
        }
    }
    return createdCount;
}

// Check if any engraissement lot has reached target weight
export async function checkPoidsCibleEngraissement(): Promise<number> {
    const lotsEnCours = await prisma.lotEngraissement.findMany({
        where: {
            statut: 'en_cours',
        },
    });

    let createdCount = 0;
    for (const lot of lotsEnCours) {
        // Get the latest weighing for this lot
        const latestPesee = await prisma.pesee.findFirst({
            where: {
                lotEngraissementId: lot.id,
            },
            orderBy: {
                date: 'desc',
            },
        });

        if (latestPesee && latestPesee.poidsMoyen >= lot.poidsCible) {
            // Check if alert already exists
            const existingAlert = await prisma.alert.findFirst({
                where: {
                    type: 'engraissement_pret',
                    relatedId: lot.id,
                    read: false,
                },
            });

            if (!existingAlert) {
                await prisma.alert.create({
                    data: {
                        type: 'engraissement_pret',
                        message: `Lot ${lot.identification} a atteint le poids cible d'engraissement (${latestPesee.poidsMoyen}/${lot.poidsCible} kg)`,
                        date: new Date(),
                        read: false,
                        relatedId: lot.id,
                    },
                });
                createdCount++;
            }
        }
    }
    return createdCount;
}

// Run all alert checks
export async function runAllAlertChecks(): Promise<{ miseBasAlerts: number; postSevrageAlerts: number; engraissementAlerts: number }> {
    const miseBasAlerts = await generateMiseBasAlerts();
    const postSevrageAlerts = await checkPoidsCiblePostSevrage();
    const engraissementAlerts = await checkPoidsCibleEngraissement();
    
    return {
        miseBasAlerts,
        postSevrageAlerts,
        engraissementAlerts,
    };
}
