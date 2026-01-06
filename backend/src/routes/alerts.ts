import { Router } from 'express';
import * as alertsController from '../controllers/alerts';
import { runAllAlertChecks } from '../services/alert-generator';

const router = Router();

router.get('/', alertsController.getAll);
router.post('/', alertsController.create);
router.put('/:id', alertsController.update);
router.delete('/:id', alertsController.remove);

// Generate automatic alerts
router.post('/generate', async (req, res) => {
    try {
        const result = await runAllAlertChecks();
        res.json({
            success: true,
            alertsGenerated: result,
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Error generating alerts' });
    }
});

export default router;

