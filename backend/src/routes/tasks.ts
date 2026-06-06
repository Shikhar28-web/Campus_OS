import { Router } from 'express';
import { taskController } from '../controllers/taskController';

const router = Router();

router.get('/', taskController.getTasks.bind(taskController));
router.get('/:id', taskController.getTaskById.bind(taskController));
router.post('/', taskController.createTask.bind(taskController));
router.patch('/:id', taskController.updateTask.bind(taskController));
router.patch('/:id/step/:stepIndex', taskController.updateTaskStep.bind(taskController));
router.delete('/:id', taskController.deleteTask.bind(taskController));

export default router;
