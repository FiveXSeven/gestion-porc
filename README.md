# Gestion Porc 🐷

Application complète de gestion de porcherie, conçue pour faciliter le suivi complet de l'élevage, de la reproduction à la vente.

## 📋 Fonctionnalités

- **Suivi des Animaux** : Gestion individuelle des truies et verrats, et gestion par lots pour l'engraissement et le post-sevrage.
- **Reproduction** : Suivi détaillé du cycle de reproduction (Saillies, Mises bas, Sevrages).
- **Finances** : Enregistrement et suivi des ventes et des dépenses.
- **Stocks** : Gestion des stocks d'aliments.
- **Tableau de Bord** : Vue d'ensemble des indicateurs clés et alertes (mises bas à venir, stocks bas, etc.).

## 🏗 Architecture Technique

Le projet est divisé en deux parties principales :

### 1. Frontend (`/src`)
Interface utilisateur moderne et responsive construite avec :
- **React** & **Vite**
- **TypeScript**
- **Shadcn UI** & **Tailwind CSS**
- **TanStack Query** pour la gestion de l'état serveur

### 2. Backend (`/backend`)
API REST robuste gérant la logique métier et les données :
- **Node.js** & **Express**
- **TypeScript**
- **Prisma** (ORM) & **SQLite**
- **Jest** pour les tests unitaires et d'intégration

## 📂 Structure du Projet

- **`src/`** : Code source du Frontend React.
  - `pages/` : Les différentes vues de l'application (Dashboard, Truies, etc.).
  - `components/` : Composants réutilisables (UI).
  - `lib/` : Utilitaires et client API (`api.ts`).
  - `types/` : Définitions TypeScript partagées (ou miroirs du backend).

- **`backend/`** : Code source de l'API Backend.
  - [Voir la documentation détaillée du backend](./backend/README.md)
  - `src/controllers/` : Logique métier.
  - `src/routes/` : Définition des endpoints.
  - `prisma/` : Schéma de la base de données.

## 🚀 Démarrage Rapide

### Prérequis
- Node.js (v18+)
- npm

### Installation globale
\`\`\`bash
npm install
cd backend && npm install && cd ..
\`\`\`

### Lancer le projet (Développement)

1. **Démarrer le Backend** :
   \`\`\`bash
   cd backend
   npx prisma db push  # Initialiser la BDD si nécessaire
   npm run dev
   \`\`\`
   Le serveur API démarrera sur `http://localhost:3000`.

2. **Démarrer le Frontend** (dans un nouveau terminal) :
   \`\`\`bash
   # Depuis la racine du projet
   npm run dev
   \`\`\`
   L'application sera accessible sur `http://localhost:8080` (ou le port indiqué).

## 🧪 Tests

- **Frontend** : `npm test` (à la racine) - Lance les tests de composants avec Vitest.
- **Backend** : `cd backend && npm test` - Lance les tests unitaires et d'intégration avec Jest.

---
*Généré pour le projet Gestion Porc*
