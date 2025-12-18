# Documentation Technique du Backend - Gestion Porc

Ce dossier contient le code source de l'API backend pour l'application de Gestion de Porcherie.

## 🛠 Technologies

- **Runtime**: Node.js
- **Framework Web**: Express.js
- **Langage**: TypeScript
- **ORM**: Prisma
- **Base de données**: SQLite
- **Tests**: Jest & Supertest

## 🚀 Installation et Démarrage

### Prérequis
- Node.js (v18+)
- npm

### Installation des dépendances
\`\`\`bash
cd backend
npm install
\`\`\`

### Configuration de la Base de Données
Le projet utilise SQLite via Prisma.

1. Générer le client Prisma :
\`\`\`bash
npx prisma generate
\`\`\`

2. Pousser le schéma vers la base de données (crée le fichier \`dev.db\`) :
\`\`\`bash
npx prisma db push
\`\`\`

### Démarrage du serveur
- **Mode Développement** (avec rechargement automatique) :
\`\`\`bash
npm run dev
\`\`\`
- **Mode Production** (build et start) :
\`\`\`bash
npm run build
npm start
\`\`\`

Le serveur démarrera par défaut sur \`http://localhost:3000\`.

## 📂 Structure du Projet

\`\`\`
backend/
├── prisma/
│   ├── schema.prisma    # Définition du schéma de la BDD
│   └── dev.db           # Base de données SQLite (générée)
├── src/
│   ├── controllers/     # Logique métier pour chaque entité
│   ├── routes/          # Définition des routes API
│   ├── tests/           # Tests unitaires et d'intégration
│   ├── index.ts         # Point d'entrée de l'application
│   └── prisma.ts        # Instance singleton du client Prisma
├── jest.config.js       # Configuration des tests
└── package.json
\`\`\`

## 🔌 API Endpoints

Tous les endpoints sont préfixés par \`/api\`.

| Ressource | Routes Principales | Description |
|-----------|-------------------|-------------|
| **Truies** | \`GET /truies\`, \`POST /truies\` | Gestion des truies reproductrices |
| **Saillies** | \`GET /saillies\`, \`POST /saillies\` | Suivi des inséminations/saillies |
| **Mises Bas** | \`GET /mises-bas\` | Enregistrement des naissances |
| **Portées** | \`GET /portees\` | Suivi des porcelets sous la mère |
| **Engraissement** | \`GET /lots-engraissement\` | Lots en phase d'engraissement |
| **Post-Sevrage** | \`GET /lots-post-sevrage\` | Lots en phase de post-sevrage |
| **Ventes** | \`GET /ventes\` | Suivi des ventes |
| **Dépenses** | \`GET /depenses\` | Suivi des dépenses |
| **Stocks** | \`GET /stock-aliments\` | Gestion des stocks d'aliments |
| **Pesées** | \`GET /pesees\` | Historique des pesées |
| **Alertes** | \`GET /alerts\` | Notifications automatiques |

## 🧪 Tests

Le projet utilise **Jest** pour les tests.

Exécuter tous les tests :
\`\`\`bash
npm test
\`\`\`

Les tests sont divisés en :
- **Tests Unitaires** : Testent les contrôleurs en mockant la base de données.
- **Tests d'Intégration** : Testent les routes API avec une base de données de test SQLite temporaire.

## 📝 Modèle de Données

Le modèle de données complet est défini dans \`prisma/schema.prisma\`. Les principales entités sont :
- \`Truie\` : Animal reproducteur.
- \`Saillie\` -> \`MiseBas\` -> \`Portee\` : Cycle de reproduction.
- \`LotEngraissement\` / \`LotPostSevrage\` : Groupes d'animaux pour la production.

---
*Généré par Antigravity*
