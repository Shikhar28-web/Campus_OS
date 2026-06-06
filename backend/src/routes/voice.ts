import { Router } from 'express';
import { voiceController } from '../controllers/voiceController';
import { upload } from '../middleware/upload';

const router = Router();

router.get('/', voiceController.getVoiceNotes.bind(voiceController));
router.post('/record', upload.single('file'), voiceController.recordVoice.bind(voiceController));
router.post('/:id/create-task', voiceController.createTaskFromVoice.bind(voiceController));
router.delete('/:id', voiceController.deleteVoiceNote.bind(voiceController));

export default router;
