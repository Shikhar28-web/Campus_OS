import { Router } from 'express';
import { inboxController } from '../controllers/inboxController';
import { upload } from '../middleware/upload';

const router = Router();

router.get('/', inboxController.getInboxItems.bind(inboxController));
router.post('/screenshot', upload.single('file'), inboxController.uploadScreenshot.bind(inboxController));
router.post('/pdf', upload.single('file'), inboxController.uploadPDF.bind(inboxController));
router.post('/manual', inboxController.addManual.bind(inboxController));
router.post('/:id/create-task', inboxController.createTaskFromInbox.bind(inboxController));
router.patch('/:id/archive', inboxController.archiveInboxItem.bind(inboxController));

export default router;
