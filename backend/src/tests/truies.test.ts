import request from 'supertest';
import express from 'express';
import truiesRoutes from '../routes/truies';

const app = express();
app.use(express.json());
app.use('/api/truies', truiesRoutes);

jest.mock('../prisma', () => ({
    __esModule: true,
    default: {
        truie: {
            findMany: jest.fn(() => Promise.resolve([
                { id: '1', identification: 'TR-TEST', archived: false }
            ])),
            findUnique: jest.fn(() => Promise.resolve({ id: '1', identification: 'TR-TEST' })),
            create: jest.fn((args) => Promise.resolve({ id: '2', ...args.data })),
            update: jest.fn((args) => Promise.resolve({ id: args.where.id, ...args.data })),
            delete: jest.fn(),
        },
        saillie: {
            findFirst: jest.fn(() => Promise.resolve(null))
        }
    }
}));

describe('Truies API', () => {
    it('GET /api/truies should return a list of truies', async () => {
        const res = await request(app).get('/api/truies');
        expect(res.statusCode).toEqual(200);
        expect(Array.isArray(res.body)).toBeTruthy();
        expect(res.body[0].identification).toBe('TR-TEST');
    });
});
