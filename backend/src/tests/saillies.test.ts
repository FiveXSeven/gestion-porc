import request from 'supertest';
import express from 'express';
import sailliesRoutes from '../routes/saillies';

const app = express();
app.use(express.json());
app.use('/api/saillies', sailliesRoutes);

jest.mock('../prisma', () => ({
    __esModule: true,
    default: {
        saillie: {
            findMany: jest.fn(() => Promise.resolve([
                {
                    id: '1',
                    truieId: 'truie1',
                    date: new Date('2024-01-01'),
                    methode: 'naturelle',
                    truie: { identification: 'TR-1' }
                }
            ])),
            findUnique: jest.fn((args) => {
                if (args.where.id === '1') {
                    return Promise.resolve({ id: '1', truieId: 'truie1', statut: 'en_cours' });
                }
                if (args.where.saillieId) {
                    return Promise.resolve(null); // No mise bas
                }
                return Promise.resolve(null);
            }),
            create: jest.fn((args) => Promise.resolve({ id: '2', ...args.data })),
            update: jest.fn((args) => Promise.resolve({ id: args.where.id, ...args.data })),
            delete: jest.fn(() => Promise.resolve({ id: '1' })),
        },
        truie: {
            findUnique: jest.fn(() => Promise.resolve({ id: 'truie1', statut: 'active' })),
            update: jest.fn()
        },
        miseBas: {
            findUnique: jest.fn(() => Promise.resolve(null))
        },
        alert: {
            create: jest.fn(() => Promise.resolve({ id: 'alert1' }))
        }
    }
}));

describe('Saillies API', () => {
    it('GET /api/saillies should return a list of saillies', async () => {
        const res = await request(app).get('/api/saillies');
        expect(res.statusCode).toEqual(200);
        expect(Array.isArray(res.body)).toBeTruthy();
        expect(res.body[0].truieId).toBe('truie1');
        expect(res.body[0].truie).toBeDefined();
    });

    it('POST /api/saillies should create a new saillie', async () => {
        const newSaillie = {
            truieId: 'truie1',
            date: '2024-01-15',
            methode: 'naturelle',
            employe: 'Jean',
            datePrevueMiseBas: '2024-05-09',
            statut: 'en_attente'
        };

        const res = await request(app).post('/api/saillies').send(newSaillie);
        expect(res.statusCode).toEqual(201);
        expect(res.body.truieId).toBe(newSaillie.truieId);
    });
});
