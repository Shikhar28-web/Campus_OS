import { Request, Response } from 'express';
import { mockDb } from '../db/mockDb';
import { aiService } from '../services/aiService';

export class FocusController {
  async getFocusRecommendation(req: Request, res: Response) {
    try {
      const tasks = mockDb.tasks.filter(t => t.status === 'pending').slice(0, 5);

      if (!tasks || tasks.length === 0) {
        return res.json({
          success: true,
          data: {
            task: null,
            reason: 'No pending tasks available',
            schedule: [],
          },
        });
      }

      const recommendation = await aiService.generateFocusRecommendation(tasks);

      const recommendedTask = tasks.find(t => t.id === recommendation.taskId);

      res.json({
        success: true,
        data: {
          task: recommendedTask
            ? {
                _id: recommendedTask.id,
                title: recommendedTask.title,
                subject: recommendedTask.subject,
                priority: recommendedTask.priority,
                deadline: recommendedTask.deadline,
              }
            : null,
          reason: recommendation.reason,
          schedule: recommendation.schedule,
        },
      });
    } catch (error: any) {
      res.status(500).json({ success: false, error: error.message });
    }
  }
}

export const focusController = new FocusController();
