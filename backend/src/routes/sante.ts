import { Router } from 'express';
import { 
    getAllVaccinations, createVaccination, deleteVaccination,
    getAllTraitements, createTraitement, deleteTraitement 
} from '../controllers/sante';

const router = Router();

// Vaccinations
router.get('/vaccinations', getAllVaccinations);
router.post('/vaccinations', createVaccination);
router.delete('/vaccinations/:id', deleteVaccination);

// Traitements
router.get('/traitements', getAllTraitements);
router.post('/traitements', createTraitement);
router.delete('/traitements/:id', deleteTraitement);

export default router;
