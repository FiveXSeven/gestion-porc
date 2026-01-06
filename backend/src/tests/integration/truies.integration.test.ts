import request from 'supertest';
import express from 'express';
import truiesRoutes from '../../routes/truies';
import { setupTestDb, teardownTestDb } from '../integration-setup';

const app = express();
app.use(express.json());
app.use('/api/truies', truiesRoutes);

describe('Truies Integration API', () => {
    let prisma: any;

    beforeAll(async () => {
        prisma = await setupTestDb();
    });

    afterAll(async () => {
        await teardownTestDb();
    });

    it('should create and retrieve a truie', async () => {
        const newTruie = {
            identification: 'TR-INT-1',
            dateEntree: '2024-01-01',
            dateNaissance: '2023-01-01',
            poids: 150,
            statut: 'active'
        };

        jest.mock('../../prisma', () => ({
            __esModule: true,
            default: prisma
        }));

        jest.resetModules();
        const routes = require('../../routes/truies').default;
        const testApp = express();
        testApp.use(express.json());
        testApp.use('/api/truies', routes);

        const resCreate = await request(testApp).post('/api/truies').send(newTruie);
        if (resCreate.status !== 201) console.log(resCreate.body);
        expect(resCreate.status).toBe(201);
        expect(resCreate.body.identification).toBe(newTruie.identification);

        // Retrieve
        const resGet = await request(testApp).get('/api/truies');
        expect(resGet.status).toBe(200);
        expect(resGet.body.length).toBeGreaterThan(0);
        expect(resGet.body.find((t: any) => t.identification === 'TR-INT-1')).toBeDefined();
    });
});
