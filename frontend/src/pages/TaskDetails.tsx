import { useEffect, useState } from 'react'
import { useNav } from '../App'
import Header from '../components/Header'
import Card from '../components/Card'
import Spinner from '../components/Spinner'
import Toast from '../components/Toast'
import api from '../lib/api'

interface TaskStep {
  label: string
  done: boolean
}

interface Task {
  _id: string
  title: string
  subject: string
  deadline: string | null
  priority: 'High' | 'Medium' | 'Low'
  status: string
  source: string
  aiSummary: string
  steps: TaskStep[]
}

const priorityColor: Record<string, string> = {
  High:   'bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400',
  Medium: 'bg-amber-100 text-amber-600 dark:bg-amber-900/30 dark:text-amber-400',
  Low:    'bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400',
}

export default function TaskDetails() {
  const { go, selectedTaskId } = useNav()
  const [task, setTask] = useState<Task | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    if (!selectedTaskId) {
      setLoading(false)
      return
    }
    api.get(`/tasks/${selectedTaskId}`)
      .then((res) => {
        if (res.data.success) setTask(res.data.data)
      })
      .catch((err) => {
        setError(err.response?.data?.error || 'Failed to load task')
      })
      .finally(() => setLoading(false))
  }, [selectedTaskId])

  const handleToggleStep = async (stepIndex: number, done: boolean) => {
    if (!task) return
    try {
      const res = await api.patch(`/tasks/${task._id}/step/${stepIndex}`, { done })
      if (res.data.success) setTask(res.data.data)
    } catch (err: unknown) {
      setError((err as { response?: { data?: { error?: string } } })?.response?.data?.error || 'Failed to update step')
    }
  }

  const BackBtn = (
    <button
      onClick={() => go('dashboard')}
      className="w-9 h-9 rounded-xl flex items-center justify-center bg-slate-100 dark:bg-gray-800 text-slate-500 dark:text-gray-400 hover:bg-slate-200 dark:hover:bg-gray-700 transition-colors"
    >
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <polyline points="15 18 9 12 15 6"/>
      </svg>
    </button>
  )

  if (!selectedTaskId) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-gray-950">
        <Header title="Task Details" subtitle="Full breakdown" right={BackBtn} />
        <main className="max-w-lg mx-auto px-4 pt-4 pb-6">
          <Card className="p-8 text-center">
            <p className="text-4xl mb-3">📋</p>
            <p className="text-sm text-slate-400 dark:text-gray-500">No task selected</p>
          </Card>
        </main>
      </div>
    )
  }

  const doneCount = task?.steps.filter(s => s.done).length ?? 0
  const totalSteps = task?.steps.length ?? 0

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-gray-950">
      <Header title="Task Details" subtitle="Full breakdown" right={BackBtn} />

      <main className="max-w-lg mx-auto px-4 pt-4 pb-6 space-y-4">
        {loading ? (
          <div className="flex justify-center py-12">
            <Spinner size="lg" />
          </div>
        ) : !task ? (
          <Card className="p-8 text-center">
            <p className="text-4xl mb-3">❌</p>
            <p className="text-sm text-slate-400 dark:text-gray-500">Task not found</p>
          </Card>
        ) : (
          <>
            {/* Title card */}
            <Card className="p-5">
              <div className="flex items-start gap-3">
                <div className="w-11 h-11 rounded-xl bg-blue-50 dark:bg-blue-900/20 flex items-center justify-center text-2xl flex-shrink-0">
                  📖
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-bold text-lg text-slate-800 dark:text-white leading-snug">{task.title}</p>
                  <div className="flex flex-wrap items-center gap-2 mt-2">
                    <span className="text-xs bg-slate-100 dark:bg-gray-800 text-slate-600 dark:text-gray-300 px-2.5 py-0.5 rounded-full font-medium">
                      {task.subject}
                    </span>
                    <span className={`text-xs px-2.5 py-0.5 rounded-full font-bold ${priorityColor[task.priority]}`}>
                      {task.priority} Priority
                    </span>
                  </div>
                </div>
              </div>
            </Card>

            {/* Meta info */}
            <div className="grid grid-cols-2 gap-2">
              {[
                { icon: '📅', label: 'Deadline', value: task.deadline ? new Date(task.deadline).toLocaleDateString() : 'No deadline' },
                { icon: '📌', label: 'Source',   value: task.source },
              ].map(m => (
                <Card key={m.label} className="p-3.5">
                  <p className="text-xl mb-1">{m.icon}</p>
                  <p className="text-[10px] text-slate-400 dark:text-gray-500 font-semibold uppercase tracking-wide">{m.label}</p>
                  <p className="text-sm font-semibold text-slate-700 dark:text-gray-200 mt-0.5">{m.value}</p>
                </Card>
              ))}
            </div>

            {/* Progress */}
            {totalSteps > 0 && (
              <Card className="p-4">
                <div className="flex items-center justify-between mb-2">
                  <p className="text-xs font-bold text-slate-400 dark:text-gray-500 uppercase tracking-widest">Progress</p>
                  <p className="text-xs font-bold text-primary-500">{doneCount}/{totalSteps} steps</p>
                </div>
                <div className="h-2 bg-slate-100 dark:bg-gray-800 rounded-full overflow-hidden mb-4">
                  <div
                    className="h-full bg-primary-500 rounded-full animate-progress"
                    style={{ width: `${(doneCount / totalSteps) * 100}%` }}
                  />
                </div>
                <div className="space-y-2.5">
                  {task.steps.map((s, i) => (
                    <div key={i} className="flex items-start gap-2.5">
                      <button
                        onClick={() => handleToggleStep(i, !s.done)}
                        className={`w-5 h-5 rounded-full border-2 mt-0.5 flex-shrink-0 flex items-center justify-center transition-colors
                          ${s.done ? 'bg-primary-500 border-primary-500' : 'border-slate-300 dark:border-gray-600'}`}
                      >
                        {s.done && (
                          <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                            <polyline points="20 6 9 17 4 12"/>
                          </svg>
                        )}
                      </button>
                      <p className={`text-sm leading-snug ${s.done ? 'line-through text-slate-400 dark:text-gray-600' : 'text-slate-700 dark:text-gray-200'}`}>
                        {s.label}
                      </p>
                    </div>
                  ))}
                </div>
              </Card>
            )}

            {/* AI Summary */}
            {task.aiSummary && (
              <Card className="p-4 border-l-4 border-l-purple-400">
                <p className="text-[10px] font-bold text-purple-500 uppercase tracking-wide mb-1">🤖 AI Insight</p>
                <p className="text-sm text-slate-700 dark:text-gray-200">
                  {task.aiSummary}
                </p>
              </Card>
            )}

            {/* Actions */}
            <div className="flex gap-2 pt-1">
              <button
                onClick={() => go('focus')}
                className="flex-1 bg-primary-500 hover:bg-primary-600 active:scale-95 text-white font-semibold text-sm py-3 rounded-2xl transition-all shadow-lg shadow-primary-500/20"
              >
                Start Focusing
              </button>
              <button className="px-5 bg-white dark:bg-gray-900 border border-slate-200 dark:border-gray-700 text-slate-500 dark:text-gray-400 font-semibold text-sm py-3 rounded-2xl hover:bg-slate-50 dark:hover:bg-gray-800 transition-all">
                Reschedule
              </button>
            </div>
          </>
        )}
      </main>

      {error && <Toast message={error} type="error" onClose={() => setError('')} />}
    </div>
  )
}
