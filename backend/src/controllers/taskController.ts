import { Request, Response } from 'express';
import { mockDb } from '../db/mockDb';
import { z } from 'zod';

const taskSchema = z.object({
  title: z.string(),
  subject: z.string(),
  deadline: z.string().nullable().optional(),
  priority: z.enum(['High', 'Medium', 'Low']),
  aiSummary: z.string().optional(),
  steps: z.array(z.object({ label: z.string(), done: z.boolean() })).optional(),
});

export class TaskController {
  async getTasks(req: Request, res: Response) {
    try {
      const { status, limit } = req.query;
      
      let data = [...mockDb.tasks];

      if (status) {
        data = data.filter(t => t.status === status);
      }

      if (limit) {
        data = data.slice(0, parseInt(limit as string));
      }

      res.json({
        success: true,
        data: data.map(t => ({
          _id: t.id,
          title: t.title,
          subject: t.subject,
          deadline: t.deadline,
          priority: t.priority,
          status: t.status,
          source: t.source,
          aiSummary: t.ai_summary,
          steps: t.steps || [],
          createdAt: t.created_at,
          updatedAt: t.updated_at,
        })),
      });
    } catch (error: any) {
      res.status(500).json({ success: false, error: error.message });
    }
  }

  async getTaskById(req: Request, res: Response) {
    try {
      const { id } = req.params;

      const data = mockDb.tasks.find(t => t.id === id);

      if (!data) {
        return res.status(404).json({ success: false, error: 'Task not found' });
      }

      res.json({
        success: true,
        data: {
          _id: data.id,
          title: data.title,
          subject: data.subject,
          deadline: data.deadline,
          priority: data.priority,
          status: data.status,
          source: data.source,
          aiSummary: data.ai_summary,
          steps: data.steps || [],
          createdAt: data.created_at,
          updatedAt: data.updated_at,
        },
      });
    } catch (error: any) {
      res.status(500).json({ success: false, error: error.message });
    }
  }

  async createTask(req: Request, res: Response) {
    try {
      const validated = taskSchema.parse(req.body);

      const data = {
        id: Date.now().toString(),
        title: validated.title,
        subject: validated.subject,
        deadline: validated.deadline || null,
        priority: validated.priority,
        status: 'pending',
        source: 'Manual',
        ai_summary: validated.aiSummary || '',
        steps: validated.steps || [],
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };

      mockDb.tasks.unshift(data);

      res.json({
        success: true,
        data: {
          _id: data.id,
          ...data,
        },
      });
    } catch (error: any) {
      res.status(400).json({ success: false, error: error.message });
    }
  }

  async updateTask(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const updates = req.body;

      const task = mockDb.tasks.find(t => t.id === id);
      if (!task) {
        return res.status(404).json({ success: false, error: 'Task not found' });
      }

      if (updates.title) task.title = updates.title;
      if (updates.subject) task.subject = updates.subject;
      if (updates.deadline !== undefined) task.deadline = updates.deadline;
      if (updates.priority) task.priority = updates.priority;
      if (updates.status) task.status = updates.status;
      if (updates.steps) task.steps = updates.steps;
      task.updated_at = new Date().toISOString();

      const data = task;

      res.json({
        success: true,
        data: {
          _id: data.id,
          title: data.title,
          subject: data.subject,
          deadline: data.deadline,
          priority: data.priority,
          status: data.status,
          source: data.source,
          aiSummary: data.ai_summary,
          steps: data.steps || [],
          createdAt: data.created_at,
          updatedAt: data.updated_at,
        },
      });
    } catch (error: any) {
      res.status(500).json({ success: false, error: error.message });
    }
  }

  async updateTaskStep(req: Request, res: Response) {
    try {
      const { id, stepIndex } = req.params;
      const { done } = req.body;

      const task = mockDb.tasks.find(t => t.id === id);
      if (!task) {
        return res.status(404).json({ success: false, error: 'Task not found' });
      }

      const steps = task.steps || [];
      const index = parseInt(stepIndex);

      if (index < 0 || index >= steps.length) {
        return res.status(400).json({ success: false, error: 'Invalid step index' });
      }

      steps[index].done = done;
      task.updated_at = new Date().toISOString();

      const data = task;

      res.json({
        success: true,
        data: {
          _id: data.id,
          title: data.title,
          subject: data.subject,
          deadline: data.deadline,
          priority: data.priority,
          status: data.status,
          source: data.source,
          aiSummary: data.ai_summary,
          steps: data.steps || [],
          createdAt: data.created_at,
          updatedAt: data.updated_at,
        },
      });
    } catch (error: any) {
      res.status(500).json({ success: false, error: error.message });
    }
  }

  async deleteTask(req: Request, res: Response) {
    try {
      const { id } = req.params;

      const index = mockDb.tasks.findIndex(t => t.id === id);
      if (index === -1) {
        return res.status(404).json({ success: false, error: 'Task not found' });
      }

      mockDb.tasks.splice(index, 1);

      res.json({ success: true, message: 'Task deleted' });
    } catch (error: any) {
      res.status(500).json({ success: false, error: error.message });
    }
  }
}

export const taskController = new TaskController();
