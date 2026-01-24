/*
  Warnings:

  - Added the required column `dateRetourChaleur` to the `Saillie` table without a default value. This is not possible if the table is not empty.

*/
-- CreateTable
CREATE TABLE "Verrat" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "identification" TEXT NOT NULL,
    "race" TEXT NOT NULL,
    "dateNaissance" DATETIME NOT NULL,
    "dateEntree" DATETIME NOT NULL,
    "poids" REAL NOT NULL,
    "statut" TEXT NOT NULL,
    "notes" TEXT NOT NULL DEFAULT '',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "Mouvement" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "date" DATETIME NOT NULL,
    "typeMouvement" TEXT NOT NULL,
    "typeAnimal" TEXT NOT NULL,
    "motif" TEXT NOT NULL,
    "quantite" INTEGER NOT NULL,
    "identification" TEXT,
    "origine" TEXT,
    "destination" TEXT,
    "poids" REAL,
    "notes" TEXT NOT NULL DEFAULT '',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "email" TEXT NOT NULL,
    "pin" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- RedefineTables
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Truie" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "identification" TEXT NOT NULL,
    "race" TEXT NOT NULL DEFAULT 'large_white',
    "dateEntree" DATETIME NOT NULL,
    "dateNaissance" DATETIME NOT NULL,
    "poids" REAL NOT NULL,
    "statut" TEXT NOT NULL,
    "notes" TEXT NOT NULL DEFAULT '',
    "archived" BOOLEAN NOT NULL DEFAULT false,
    "archivedAt" DATETIME,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);
INSERT INTO "new_Truie" ("createdAt", "dateEntree", "dateNaissance", "id", "identification", "notes", "poids", "statut", "updatedAt") SELECT "createdAt", "dateEntree", "dateNaissance", "id", "identification", "notes", "poids", "statut", "updatedAt" FROM "Truie";
DROP TABLE "Truie";
ALTER TABLE "new_Truie" RENAME TO "Truie";
CREATE UNIQUE INDEX "Truie_identification_key" ON "Truie"("identification");
CREATE TABLE "new_Saillie" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "truieId" TEXT NOT NULL,
    "verratId" TEXT,
    "date" DATETIME NOT NULL,
    "methode" TEXT NOT NULL,
    "employe" TEXT NOT NULL,
    "datePrevueMiseBas" DATETIME NOT NULL,
    "dateRetourChaleur" DATETIME NOT NULL,
    "statut" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Saillie_truieId_fkey" FOREIGN KEY ("truieId") REFERENCES "Truie" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Saillie_verratId_fkey" FOREIGN KEY ("verratId") REFERENCES "Verrat" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_Saillie" ("createdAt", "date", "datePrevueMiseBas", "employe", "id", "methode", "statut", "truieId", "updatedAt") SELECT "createdAt", "date", "datePrevueMiseBas", "employe", "id", "methode", "statut", "truieId", "updatedAt" FROM "Saillie";
DROP TABLE "Saillie";
ALTER TABLE "new_Saillie" RENAME TO "Saillie";
PRAGMA foreign_key_check;
PRAGMA foreign_keys=ON;

-- CreateIndex
CREATE UNIQUE INDEX "Verrat_identification_key" ON "Verrat"("identification");

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");
