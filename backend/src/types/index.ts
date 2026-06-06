export interface Task {
  id: string;
  title: string;
  subject: string;
  deadline: string | null;
  priority: 'High' | 'Medium' | 'Low';
  status: 'pending' | 'completed' | 'archived';
  source: string;
  aiSummary: string;
  steps: TaskStep[];
  userId: string;
  createdAt: string;
  updatedAt: string;
}

export interface TaskStep {
  label: string;
  done: boolean;
}

export interface InboxItem {
  id: string;
  userId: string;
  kind: 'Screenshot' | 'PDF' | 'Voice' | 'Manual';
  status: 'New' | 'Processed' | 'Archived';
  extracted: string;
  originalText: string;
  filePath: string | null;
  taskId: string | null;
  createdAt: string;
}

export interface VoiceNote {
  id: string;
  userId: string;
  transcript: string;
  duration: number;
  filePath: string;
  processed: boolean;
  taskId: string | null;
  createdAt: string;
}

export interface PulseData {
  overallScore: number;
  riskLevel: 'Low' | 'Medium' | 'High';
  subjects: Array<{
    name: string;
    score: number;
    pendingAssignments: number;
  }>;
  upcoming: Array<{
    title: string;
    date: string;
    days: number;
    type: string;
  }>;
  weeklyActivity: number[];
  stats: {
    total: number;
    completed: number;
    overdue: number;
    dueSoon: number;
  };
}
