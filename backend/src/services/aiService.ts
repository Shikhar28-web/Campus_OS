import axios from 'axios';
import { config } from '../config/config';

const OPENROUTER_URL = 'https://openrouter.ai/api/v1/chat/completions';

export class AIService {
  private async callLLM(prompt: string, systemPrompt?: string): Promise<string> {
    try {
      const response = await axios.post(
        OPENROUTER_URL,
        {
          model: 'openai/gpt-4o-mini',
          messages: [
            ...(systemPrompt ? [{ role: 'system', content: systemPrompt }] : []),
            { role: 'user', content: prompt },
          ],
        },
        {
          headers: {
            'Authorization': `Bearer ${config.openRouter.apiKey}`,
            'Content-Type': 'application/json',
            'HTTP-Referer': 'https://campusos.dev',
            'X-Title': 'CampusOS',
          },
        }
      );

      return response.data.choices[0]?.message?.content || '';
    } catch (error: any) {
      console.error('OpenRouter API Error:', error.response?.data || error.message);
      throw new Error('AI service error');
    }
  }

  async extractTaskFromText(text: string): Promise<{
    title: string;
    subject: string;
    deadline: string | null;
    priority: 'High' | 'Medium' | 'Low';
    aiSummary: string;
    steps: Array<{ label: string; done: boolean }>;
  }> {
    const prompt = `Extract task information from this text and return ONLY a valid JSON object (no markdown, no explanations):

Text: "${text}"

Return JSON with these exact fields:
{
  "title": "brief task title",
  "subject": "subject/category like Physics, Math, etc",
  "deadline": "YYYY-MM-DD or null",
  "priority": "High" or "Medium" or "Low",
  "aiSummary": "brief summary of what needs to be done",
  "steps": [{"label": "step description", "done": false}]
}`;

    const response = await this.callLLM(
      prompt,
      'You are a task extraction assistant. Always respond with valid JSON only, no markdown formatting.'
    );

    try {
      // Clean the response - remove markdown code blocks if present
      let cleaned = response.trim();
      if (cleaned.startsWith('```json')) {
        cleaned = cleaned.replace(/```json\n?/, '').replace(/\n?```$/, '');
      } else if (cleaned.startsWith('```')) {
        cleaned = cleaned.replace(/```\n?/, '').replace(/\n?```$/, '');
      }
      
      const parsed = JSON.parse(cleaned);
      return {
        title: parsed.title || 'Untitled Task',
        subject: parsed.subject || 'General',
        deadline: parsed.deadline || null,
        priority: ['High', 'Medium', 'Low'].includes(parsed.priority) ? parsed.priority : 'Medium',
        aiSummary: parsed.aiSummary || '',
        steps: Array.isArray(parsed.steps) ? parsed.steps : [],
      };
    } catch (error) {
      console.error('Failed to parse AI response:', response);
      // Return fallback task
      return {
        title: text.slice(0, 50),
        subject: 'General',
        deadline: null,
        priority: 'Medium',
        aiSummary: text,
        steps: [],
      };
    }
  }

  async generateFocusRecommendation(tasks: any[]): Promise<{
    taskId: string | null;
    reason: string;
    schedule: Array<{ time: string; label: string; duration: string }>;
  }> {
    if (tasks.length === 0) {
      return {
        taskId: null,
        reason: 'No tasks available',
        schedule: [],
      };
    }

    const tasksJson = JSON.stringify(
      tasks.map(t => ({
        id: t.id,
        title: t.title,
        subject: t.subject,
        priority: t.priority,
        deadline: t.deadline,
      }))
    );

    const prompt = `Given these tasks, recommend ONE task to focus on now and create a study schedule. Return ONLY valid JSON:

Tasks: ${tasksJson}

Return JSON:
{
  "taskId": "id of recommended task",
  "reason": "brief explanation why this task",
  "schedule": [
    {"time": "09:00", "label": "Task name", "duration": "45 min"},
    {"time": "10:00", "label": "Break", "duration": "15 min"}
  ]
}`;

    const response = await this.callLLM(
      prompt,
      'You are a study planner. Always respond with valid JSON only.'
    );

    try {
      let cleaned = response.trim();
      if (cleaned.startsWith('```json')) {
        cleaned = cleaned.replace(/```json\n?/, '').replace(/\n?```$/, '');
      } else if (cleaned.startsWith('```')) {
        cleaned = cleaned.replace(/```\n?/, '').replace(/\n?```$/, '');
      }
      
      const parsed = JSON.parse(cleaned);
      return {
        taskId: parsed.taskId || tasks[0].id,
        reason: parsed.reason || 'This task has the highest priority',
        schedule: Array.isArray(parsed.schedule) ? parsed.schedule : [],
      };
    } catch (error) {
      console.error('Failed to parse focus recommendation:', response);
      return {
        taskId: tasks[0].id,
        reason: 'This task has the highest priority',
        schedule: [],
      };
    }
  }

  async transcribeAudio(audioPath: string): Promise<string> {
    // For demo purposes, return a placeholder
    // In production, you would call Whisper API via OpenRouter or another service
    return 'Audio transcription placeholder - implement Whisper API integration';
  }
}

export const aiService = new AIService();
