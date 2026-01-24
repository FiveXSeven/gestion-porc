import dotenv from 'dotenv';
dotenv.config();

import express from 'express';
import cors from 'cors';
import rateLimit from 'express-rate-limit';
import { authenticateToken } from './middleware/auth';
import truiesRoutes from './routes/truies';
import sailliesRoutes from './routes/saillies';
import misesBasRoutes from './routes/mises-bas';
import porteesRoutes from './routes/portees';
import ventesRoutes from './routes/ventes';
import depensesRoutes from './routes/depenses';
import alertsRoutes from './routes/alerts';
import lotsEngraissementRoutes from './routes/lots-engraissement';
import lotsPostSevrageRoutes from './routes/lots-post-sevrage';
import peseesRoutes from './routes/pesees';
import stockAlimentsRoutes from './routes/stock-aliments';
import mortalitesRoutes from './routes/mortalites';
import consommationsRoutes from './routes/consommations';
import santeRoutes from './routes/sante';
import verratsRoutes from './routes/verrats';
import mouvementsRoutes from './routes/mouvements';
import authRoutes from './routes/auth';

const app = express();
const port = process.env.PORT || 3000;

// Configuration CORS
app.use(cors({
    origin: process.env.FRONTEND_URL || 'http://localhost:8081',
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(express.json());

// Rate Limiting pour prévenir les attaques brute-force
const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // limite chaque IP à 100 requêtes par windowMs
    message: { error: 'Trop de requêtes, veuillez réessayer plus tard.' }
});
app.use('/api/', limiter);

// Routes publiques
app.use('/api/auth', authRoutes);

// Middleware d'authentification pour toutes les autres routes
app.use('/api', authenticateToken);

// Routes protégées
app.use('/api/truies', truiesRoutes);
app.use('/api/saillies', sailliesRoutes);
app.use('/api/mises-bas', misesBasRoutes);
app.use('/api/portees', porteesRoutes);
app.use('/api/ventes', ventesRoutes);
app.use('/api/depenses', depensesRoutes);
app.use('/api/alerts', alertsRoutes);
app.use('/api/lots-engraissement', lotsEngraissementRoutes);
app.use('/api/lots-post-sevrage', lotsPostSevrageRoutes);
app.use('/api/pesees', peseesRoutes);
app.use('/api/stock-aliments', stockAlimentsRoutes);
app.use('/api/mortalites', mortalitesRoutes);
app.use('/api/consommations', consommationsRoutes);
app.use('/api/sante', santeRoutes);
app.use('/api/verrats', verratsRoutes);
app.use('/api/mouvements', mouvementsRoutes);

app.get('/', (req, res) => {
    res.send('Gestion Porc API is running');
});

app.listen(port, () => {
    console.log(`Server is running at http://localhost:${port}`);
});
