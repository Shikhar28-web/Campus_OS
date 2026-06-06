import { Request, Response } from 'express';
import { mockDb } from '../db/mockDb';
import { aiService } from '../services/aiService';

export class VoiceController {
  async getVoiceNotes(req: Request, res: Response) {
    try {
      const data = mockDb.voiceNotes;

      res.json({
        success: true,
        data: data.map(note => ({
          _id: note.id,
          transcript: note.transcript,
          duration: note.duration,
          processed: note.processed,
          taskId: note.task_id,
          createdAt: note.created_at,
        })),
      });
    } catch (error: any) {
      res.status(500).json({ success: false, error: error.message });
    }
  }

  async recordVoice(req: Request, res: Response) {
    try {
      if (!req.file) {
        return res.status(400).json({ success: false, error: 'No audio file uploaded' });
      }

      const duration = parseInt(req.body.duration || '0');

      // For demo, use placeholder transcript
      // In production, call Whisper API
      const transcript = `Voice note: "${req.file.originalname}" recorded at ${new Date().toLocaleTimeString()}`;

      const data = {
        id: Date.now().toString(),
        transcript,
        duration,
        file_path: req.file.path,
        processed: true,
        task_id: null,
        created_at: new Date().toISOString(),
      };

      mockDb.voiceNotes.unshift(data);

      res.json({
        success: true,
        data: {
          _id: data.id,
          transcript: data.transcript,
          duration: data.duration,
          processed: data.processed,
          taskId: data.task_id,
          createdAt: data.created_at,
        },
      });
    } catch (error: any) {
      res.status(500).json({ success: false, error: error.message });
    }
  }

  async createTaskFromVoice(req: Request, res: Response) {
    try {
      const { id } = req.params;

      const voiceNote = mockDb.voiceNotes.find(v => v.id === id);
      if (!voiceNote) {
        return res.status(404).json({ success: false, error: 'Voice note not found' });
      }

      const taskData = await aiService.extractTaskFromText(voiceNote.transcript);

      const task = {
        id: Date.now().toString(),
        title: taskData.title,
        subject: taskData.subject,
        deadline: taskData.deadline,
        priority: taskData.priority,
        status: 'pending',
        source: 'Voice',
        ai_summary: taskData.aiSummary,
        steps: taskData.steps,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };

      mockDb.tasks.unshift(task);
      voiceNote.task_id = task.id;

      res.json({
        success: true,
        data: {
          _id: task.id,
          title: task.title,
          subject: task.subject,
        },
      });
    } catch (error: any) {
      res.status(500).json({ success: false, error: error.message });
    }
  }

  async deleteVoiceNote(req: Request, res: Response) {
    try {
      const { id } = req.params;

      const index = mockDb.voiceNotes.findIndex(v => v.id === id);
      if (index === -1) {
        return res.status(404).json({ success: false, error: 'Voice note not found' });
      }

      mockDb.voiceNotes.splice(index, 1);

      res.json({ success: true, message: 'Voice note deleted' });
    } catch (error: any) {
      res.status(500).json({ success: false, error: error.message });
    }
  }
}

export const voiceController = new VoiceController();
