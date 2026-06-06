import { Request, Response } from 'express';
import { mockDb } from '../db/mockDb';

export class PulseController {
  async getAcademicPulse(req: Request, res: Response) {
    try {
      const tasks = mockDb.tasks;

      const now = new Date();
      const total = tasks?.length || 0;
      const completed = tasks?.filter(t => t.status === 'completed').length || 0;
      const overdue = tasks?.filter(t => {
        if (!t.deadline || t.status === 'completed') return false;
        return new Date(t.deadline) < now;
      }).length || 0;
      const dueSoon = tasks?.filter(t => {
        if (!t.deadline || t.status === 'completed') return false;
        const daysUntil = (new Date(t.deadline).getTime() - now.getTime()) / (1000 * 60 * 60 * 24);
        return daysUntil >= 0 && daysUntil <= 7;
      }).length || 0;

      // Calculate overall score
      let score = 100;
      score -= overdue * 15;
      score -= (total - completed) * 2;
      score = Math.max(0, Math.min(100, score));

      // Risk level
      let riskLevel: 'Low' | 'Medium' | 'High' = 'Low';
      if (overdue > 3 || score < 50) riskLevel = 'High';
      else if (overdue > 0 || score < 70) riskLevel = 'Medium';

      // Group by subject
      const subjectMap = new Map<string, { score: number; pending: number }>();
      tasks?.forEach(t => {
        const subject = t.subject || 'General';
        if (!subjectMap.has(subject)) {
          subjectMap.set(subject, { score: 85, pending: 0 });
        }
        const subj = subjectMap.get(subject)!;
        if (t.status !== 'completed') {
          subj.pending++;
          subj.score -= 5;
        }
        subjectMap.set(subject, subj);
      });

      const subjects = Array.from(subjectMap.entries()).map(([name, data]) => ({
        name,
        score: Math.max(0, Math.min(100, data.score)),
        pendingAssignments: data.pending,
      }));

      // Upcoming deadlines
      const upcoming = tasks
        ?.filter(t => t.deadline && t.status !== 'completed')
        .map(t => {
          const days = Math.ceil((new Date(t.deadline!).getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
          return {
            title: t.title,
            date: t.deadline!,
            days,
            type: t.subject || 'Task',
          };
        })
        .sort((a, b) => a.days - b.days)
        .slice(0, 5) || [];

      // Weekly activity (mock data for demo)
      const weeklyActivity = [45, 60, 70, 55, 80, 65, 75];

      res.json({
        success: true,
        data: {
          overallScore: score,
          riskLevel,
          subjects,
          upcoming,
          weeklyActivity,
          stats: {
            total,
            completed,
            overdue,
            dueSoon,
          },
        },
      });
    } catch (error: any) {
      res.status(500).json({ success: false, error: error.message });
    }
  }
}

export const pulseController = new PulseController();
