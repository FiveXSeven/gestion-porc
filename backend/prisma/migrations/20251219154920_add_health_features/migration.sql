/*
  Warnings:

  - You are about to drop the `Verrat` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the column `verratId` on the `Saillie` table. All the data in the column will be lost.

*/
-- DropIndex
DROP INDEX "Verrat_identification_key";

-- DropTable
PRAGMA foreign_keys=off;
DROP TABLE "Verrat";
PRAGMA foreign_keys=on;

-- CreateTable
CREATE TABLE "Mortalite" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "date" DATETIME NOT NULL,
    "nombre" INTEGER NOT NULL,
    "cause" TEXT NOT NULL,
    "notes" TEXT NOT NULL DEFAULT '',
    "lotEngraissementId" TEXT,
    "lotPostSevrageId" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Mortalite_lotEngraissementId_fkey" FOREIGN KEY ("lotEngraissementId") REFERENCES "LotEngraissement" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "Mortalite_lotPostSevrageId_fkey" FOREIGN KEY ("lotPostSevrageId") REFERENCES "LotPostSevrage" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "ConsommationAliment" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "date" DATETIME NOT NULL,
    "quantiteSacs" REAL NOT NULL,
    "stockAlimentId" TEXT NOT NULL,
    "lotEngraissementId" TEXT,
    "lotPostSevrageId" TEXT,
    "notes" TEXT NOT NULL DEFAULT '',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "ConsommationAliment_stockAlimentId_fkey" FOREIGN KEY ("stockAlimentId") REFERENCES "StockAliment" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "ConsommationAliment_lotEngraissementId_fkey" FOREIGN KEY ("lotEngraissementId") REFERENCES "LotEngraissement" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "ConsommationAliment_lotPostSevrageId_fkey" FOREIGN KEY ("lotPostSevrageId") REFERENCES "LotPostSevrage" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Vaccination" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "date" DATETIME NOT NULL,
    "nom" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "lotType" TEXT NOT NULL,
    "lotId" TEXT,
    "truieId" TEXT,
    "dateRappel" DATETIME,
    "notes" TEXT NOT NULL DEFAULT '',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateTable
CREATE TABLE "Traitement" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "date" DATETIME NOT NULL,
    "nom" TEXT NOT NULL,
    "medicament" TEXT NOT NULL,
    "dureeJours" INTEGER NOT NULL,
    "lotType" TEXT NOT NULL,
    "lotId" TEXT,
    "truieId" TEXT,
    "notes" TEXT NOT NULL DEFAULT '',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- RedefineTables
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Saillie" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "truieId" TEXT NOT NULL,
    "date" DATETIME NOT NULL,
    "methode" TEXT NOT NULL,
    "employe" TEXT NOT NULL,
    "datePrevueMiseBas" DATETIME NOT NULL,
    "statut" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Saillie_truieId_fkey" FOREIGN KEY ("truieId") REFERENCES "Truie" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_Saillie" ("createdAt", "date", "datePrevueMiseBas", "employe", "id", "methode", "statut", "truieId", "updatedAt") SELECT "createdAt", "date", "datePrevueMiseBas", "employe", "id", "methode", "statut", "truieId", "updatedAt" FROM "Saillie";
DROP TABLE "Saillie";
ALTER TABLE "new_Saillie" RENAME TO "Saillie";
PRAGMA foreign_key_check;
PRAGMA foreign_keys=ON;
