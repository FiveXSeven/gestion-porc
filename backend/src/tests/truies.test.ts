import request from 'supertest';
import express from 'express';
import truiesRoutes from '../routes/truies';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();
const app = express();
app.use(express.json());
app.use('/api/truies', truiesRoutes);

// Mock Prisma to avoid hitting the actual database during unit/integration tests for now
// Or we can use a test database. For this first step, let's try to hit a test endpoint or mock.
// Actually, let's create a simple unit test first that doesn't rely on the DB connection if possible,
// or use a test database. Given the user asked for unit and integration tests, let's start with a simple integration test using valid mocks or a test DB.

// For simplicity and speed in this environment, let's mock the prisma client calls in the controller if strictly unit testing,
// but for integration testing `supertest` usually hits the app.
// Let's assume we want to mock prisma for unit tests.

jest.mock('../prisma', () => ({
    __esModule: true,
    default: {
        truie: {
            findMany: jest.fn(() => Promise.resolve([
                { id: '1', identification: 'TR-TEST' }
            ])),
            create: jest.fn((args) => Promise.resolve({ id: '2', ...args.data })),
            update: jest.fn(),
            delete: jest.fn(),
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
