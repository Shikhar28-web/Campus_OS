import { Request, Response } from 'express';
import { mockDb } from '../db/mockDb';
import { ocrService } from '../services/ocrService';
import { aiService } from '../services/aiService';

export class InboxController {
  async getInboxItems(req: Request, res: Response) {
    try {
      const data = mockDb.inboxItems;

      res.json({
        success: true,
        data: data.map(item => ({
          _id: item.id,
          kind: item.kind,
          status: item.status,
          extracted: item.extracted,
          originalText: item.original_text,
          taskId: item.task_id,
          createdAt: item.created_at,
        })),
      });
    } catch (error: any) {
      res.status(500).json({ success: false, error: error.message });
    }
  }

  async uploadScreenshot(req: Request, res: Response) {
    try {
      if (!req.file) {
        return res.status(400).json({ success: false, error: 'No file uploaded' });
      }

      const extractedText = await ocrService.extractTextFromImage(req.file.path);
      const taskData = await aiService.extractTaskFromText(extractedText);

      const data = {
        id: Date.now().toString(),
        kind: 'Screenshot' as const,
        status: 'Processed' as const,
        extracted: taskData.title,
        original_text: extractedText,
        file_path: req.file.path,
        task_id: null,
        created_at: new Date().toISOString(),
      };

      mockDb.inboxItems.unshift(data);

      res.json({
        success: true,
        data: {
          _id: data.id,
          kind: data.kind,
          status: data.status,
          extracted: data.extracted,
          originalText: data.original_text,
          taskId: data.task_id,
          createdAt: data.created_at,
        },
      });
    } catch (error: any) {
      res.status(500).json({ success: false, error: error.message });
    }
  }

  async uploadPDF(req: Request, res: Response) {
    try {
      if (!req.file) {
        return res.status(400).json({ success: false, error: 'No file uploaded' });
      }

      const extractedText = await ocrService.extractTextFromPDF(req.file.path);
      const taskData = await aiService.extractTaskFromText(extractedText);

      const data = {
        id: Date.now().toString(),
        kind: 'PDF' as const,
        status: 'Processed' as const,
        extracted: taskData.title,
        original_text: extractedText,
        file_path: req.file.path,
        task_id: null,
        created_at: new Date().toISOString(),
      };

      mockDb.inboxItems.unshift(data);

      res.json({
        success: true,
        data: {
          _id: data.id,
          kind: data.kind,
          status: data.status,
          extracted: data.extracted,
          originalText: data.original_text,
          taskId: data.task_id,
          createdAt: data.created_at,
        },
      });
    } catch (error: any) {
      res.status(500).json({ success: false, error: error.message });
    }
  }

  async addManual(req: Request, res: Response) {
    try {
      const { text } = req.body;

      if (!text) {
        return res.status(400).json({ success: false, error: 'Text is required' });
      }

      const data = {
        id: Date.now().toString(),
        kind: 'Manual' as const,
        status: 'New' as const,
        extracted: text.slice(0, 100),
        original_text: text,
        file_path: null,
        task_id: null,
        created_at: new Date().toISOString(),
      };

      mockDb.inboxItems.unshift(data);

      res.json({
        success: true,
        data: {
          _id: data.id,
          kind: data.kind,
          status: data.status,
          extracted: data.extracted,
          originalText: data.original_text,
          taskId: data.task_id,
          createdAt: data.created_at,
        },
      });
    } catch (error: any) {
      res.status(500).json({ success: false, error: error.message });
    }
  }

  async createTaskFromInbox(req: Request, res: Response) {
    try {
      const { id } = req.params;

      const inboxItem = mockDb.inboxItems.find(i => i.id === id);
      if (!inboxItem) {
        return res.status(404).json({ success: false, error: 'Inbox item not found' });
      }

      const taskData = await aiService.extractTaskFromText(inboxItem.original_text);

      const task = {
        id: Date.now().toString(),
        title: taskData.title,
        subject: taskData.subject,
        deadline: taskData.deadline,
        priority: taskData.priority,
        status: 'pending',
        source: inboxItem.kind,
        ai_summary: taskData.aiSummary,
        steps: taskData.steps,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };

      mockDb.tasks.unshift(task);
      inboxItem.task_id = task.id;
      inboxItem.status = 'Processed';

      res.json({
        success: true,
        data: {
          _id: task.id,
          title: task.title,
          subject: task.subject,
          deadline: task.deadline,
          priority: task.priority,
          status: task.status,
          source: task.source,
          aiSummary: task.ai_summary,
          steps: task.steps || [],
        },
      });
    } catch (error: any) {
      res.status(500).json({ success: false, error: error.message });
    }
  }

  async archiveInboxItem(req: Request, res: Response) {
    try {
      const { id } = req.params;

      const item = mockDb.inboxItems.find(i => i.id === id);
      if (!item) {
        return res.status(404).json({ success: false, error: 'Item not found' });
      }

      item.status = 'Archived';

      res.json({ success: true, message: 'Item archived' });
    } catch (error: any) {
      res.status(500).json({ success: false, error: error.message });
    }
  }
}

export const inboxController = new InboxController();
