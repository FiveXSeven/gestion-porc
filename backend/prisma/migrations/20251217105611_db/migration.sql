-- CreateTable
CREATE TABLE "Truie" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "identification" TEXT NOT NULL,
    "dateEntree" DATETIME NOT NULL,
    "dateNaissance" DATETIME NOT NULL,
    "poids" REAL NOT NULL,
    "statut" TEXT NOT NULL,
    "notes" TEXT NOT NULL DEFAULT '',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "Verrat" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "identification" TEXT NOT NULL,
    "dateEntree" DATETIME NOT NULL,
    "dateNaissance" DATETIME NOT NULL,
    "poids" REAL NOT NULL,
    "statut" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "Saillie" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "truieId" TEXT NOT NULL,
    "verratId" TEXT NOT NULL,
    "date" DATETIME NOT NULL,
    "methode" TEXT NOT NULL,
    "employe" TEXT NOT NULL,
    "datePrevueMiseBas" DATETIME NOT NULL,
    "statut" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Saillie_truieId_fkey" FOREIGN KEY ("truieId") REFERENCES "Truie" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Saillie_verratId_fkey" FOREIGN KEY ("verratId") REFERENCES "Verrat" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "MiseBas" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "saillieId" TEXT NOT NULL,
    "truieId" TEXT NOT NULL,
    "date" DATETIME NOT NULL,
    "nesVivants" INTEGER NOT NULL,
    "mortNes" INTEGER NOT NULL,
    "poidsMoyen" REAL NOT NULL,
    "notes" TEXT NOT NULL DEFAULT '',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "MiseBas_saillieId_fkey" FOREIGN KEY ("saillieId") REFERENCES "Saillie" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "MiseBas_truieId_fkey" FOREIGN KEY ("truieId") REFERENCES "Truie" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Portee" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "miseBasId" TEXT NOT NULL,
    "truieId" TEXT NOT NULL,
    "nombreActuel" INTEGER NOT NULL,
    "dateSevrage" DATETIME,
    "poidsSevrage" REAL,
    "statut" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Portee_miseBasId_fkey" FOREIGN KEY ("miseBasId") REFERENCES "MiseBas" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Portee_truieId_fkey" FOREIGN KEY ("truieId") REFERENCES "Truie" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Vente" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "date" DATETIME NOT NULL,
    "typeAnimal" TEXT NOT NULL,
    "quantite" INTEGER NOT NULL,
    "poidsTotal" REAL NOT NULL,
    "prixUnitaire" REAL NOT NULL,
    "prixTotal" REAL NOT NULL,
    "acheteur" TEXT NOT NULL,
    "notes" TEXT NOT NULL DEFAULT '',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateTable
CREATE TABLE "Depense" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "date" DATETIME NOT NULL,
    "categorie" TEXT NOT NULL,
    "montant" REAL NOT NULL,
    "description" TEXT NOT NULL,
    "fournisseur" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateTable
CREATE TABLE "Alert" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "type" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "date" DATETIME NOT NULL,
    "read" BOOLEAN NOT NULL DEFAULT false,
    "relatedId" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateTable
CREATE TABLE "LotEngraissement" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "identification" TEXT NOT NULL,
    "dateCreation" DATETIME NOT NULL,
    "origine" TEXT NOT NULL,
    "porteeId" TEXT,
    "nombreInitial" INTEGER NOT NULL,
    "nombreActuel" INTEGER NOT NULL,
    "poidsEntree" REAL NOT NULL,
    "dateEntree" DATETIME NOT NULL,
    "poidsCible" REAL NOT NULL,
    "statut" TEXT NOT NULL,
    "notes" TEXT NOT NULL DEFAULT '',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "LotEngraissement_porteeId_fkey" FOREIGN KEY ("porteeId") REFERENCES "Portee" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Pesee" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "lotEngraissementId" TEXT,
    "lotPostSevrageId" TEXT,
    "date" DATETIME NOT NULL,
    "poidsMoyen" REAL NOT NULL,
    "nombrePeses" INTEGER NOT NULL,
    "notes" TEXT NOT NULL DEFAULT '',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Pesee_lotEngraissementId_fkey" FOREIGN KEY ("lotEngraissementId") REFERENCES "LotEngraissement" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "Pesee_lotPostSevrageId_fkey" FOREIGN KEY ("lotPostSevrageId") REFERENCES "LotPostSevrage" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "StockAliment" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "nom" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "quantite" REAL NOT NULL,
    "poidsSac" REAL NOT NULL,
    "dateMiseAJour" DATETIME NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "LotPostSevrage" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "identification" TEXT NOT NULL,
    "dateCreation" DATETIME NOT NULL,
    "origine" TEXT NOT NULL,
    "porteeId" TEXT,
    "nombreInitial" INTEGER NOT NULL,
    "nombreActuel" INTEGER NOT NULL,
    "poidsEntree" REAL NOT NULL,
    "dateEntree" DATETIME NOT NULL,
    "poidsCible" REAL NOT NULL,
    "statut" TEXT NOT NULL,
    "notes" TEXT NOT NULL DEFAULT '',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "LotPostSevrage_porteeId_fkey" FOREIGN KEY ("porteeId") REFERENCES "Portee" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "Truie_identification_key" ON "Truie"("identification");

-- CreateIndex
CREATE UNIQUE INDEX "Verrat_identification_key" ON "Verrat"("identification");

-- CreateIndex
CREATE UNIQUE INDEX "MiseBas_saillieId_key" ON "MiseBas"("saillieId");

-- CreateIndex
CREATE UNIQUE INDEX "Portee_miseBasId_key" ON "Portee"("miseBasId");

-- CreateIndex
CREATE UNIQUE INDEX "LotEngraissement_identification_key" ON "LotEngraissement"("identification");

-- CreateIndex
CREATE UNIQUE INDEX "LotPostSevrage_identification_key" ON "LotPostSevrage"("identification");
