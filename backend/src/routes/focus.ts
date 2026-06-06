import { Router } from 'express';
import { focusController } from '../controllers/focusController';

const router = Router();

router.get('/recommend', focusController.getFocusRecommendation.bind(focusController));

export default router;
