import { Router } from 'express';
import { 
    getAllVaccinations, createVaccination, deleteVaccination,
    getAllTraitements, createTraitement, deleteTraitement 
} from '../controllers/sante';
import { validateIdParam } from '../middleware/validate-id';

const router = Router();

// Vaccinations
router.get('/vaccinations', getAllVaccinations);
router.post('/vaccinations', createVaccination);
router.delete('/vaccinations/:id', validateIdParam, deleteVaccination);

// Traitements
router.get('/traitements', getAllTraitements);
router.post('/traitements', createTraitement);
router.delete('/traitements/:id', validateIdParam, deleteTraitement);

export default router;
