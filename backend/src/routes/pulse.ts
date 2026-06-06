import { Router } from 'express';
import { pulseController } from '../controllers/pulseController';

const router = Router();

router.get('/', pulseController.getAcademicPulse.bind(pulseController));

export default router;
