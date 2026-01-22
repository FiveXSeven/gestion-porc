import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
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

dotenv.config();

const app = express();
const port = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

// Routes
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
