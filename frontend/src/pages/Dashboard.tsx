import { useEffect, useState } from 'react'
import { useNav } from '../App'
import Header from '../components/Header'
import Card from '../components/Card'
import Spinner from '../components/Spinner'
import Toast from '../components/Toast'
import api from '../lib/api'

interface Task {
  _id: string
  title: string
  subject: string
  deadline: string | null
  priority: 'High' | 'Medium' | 'Low'
  status: string
}

interface PulseData {
  overallScore: number
  riskLevel: 'Low' | 'Medium' | 'High'
  stats: { total: number; completed: number; overdue: number; dueSoon: number }
}

const priorityColor: Record<string, string> = {
  High:   'bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400',
  Medium: 'bg-amber-100 text-amber-600 dark:bg-amber-900/30 dark:text-amber-400',
  Low:    'bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400',
}

const quickActions = [
  { icon: '📸', label: 'Scan',   desc: 'Screenshot',  screen: 'inbox'  as const },
  { icon: '🎤', label: 'Voice',  desc: 'Voice note',   screen: 'voice'  as const },
  { icon: '⚡', label: 'Focus',  desc: 'Start session', screen: 'focus' as const },
  { icon: '📊', label: 'Pulse',  desc: 'Academic',     screen: 'pulse'  as const },
]

export default function Dashboard() {
  const { go } = useNav()
  const [tasks, setTasks] = useState<Task[]>([])
  const [pulse, setPulse] = useState<PulseData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [backendError, setBackendError] = useState(false)

  useEffect(() => {
    Promise.all([
      api.get('/tasks', { params: { status: 'pending', limit: 3 } }),
      api.get('/pulse'),
    ])
      .then(([tasksRes, pulseRes]) => {
        if (tasksRes.data.success) setTasks(tasksRes.data.data)
        if (pulseRes.data.success) setPulse(pulseRes.data.data)
      })
      .catch((err) => {
        console.error('API Error:', err)
        setBackendError(true)
        setError(err.response?.data?.error || 'Backend connection failed. Check SETUP_INSTRUCTIONS.md')
      })
      .finally(() => setLoading(false))
  }, [])

  const score = pulse?.overallScore ?? 78
  const risk = pulse?.riskLevel ?? 'Low'
  const stats = pulse?.stats ?? { total: 0, completed: 0, overdue: 0, dueSoon: 0 }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-gray-950">
      <Header title="CampusOS" subtitle="Your student OS" />

      <main className="max-w-lg mx-auto px-4 pt-4 pb-6 space-y-4">
        {loading ? (
          <div className="flex justify-center py-12">
            <Spinner size="lg" />
          </div>
        ) : (
          <>
            {/* ── Hero / Pulse score ── */}
            <Card gradient className="p-5">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-primary-100 text-sm font-medium">Academic Pulse</p>
                  <div className="flex items-end gap-2 mt-1">
                    <span className="text-5xl font-extrabold text-white">{score}</span>
                    <span className="text-primary-200 text-sm mb-2">/ 100</span>
                  </div>
                  <div className="flex items-center gap-1.5 mt-1">
                    <span className="inline-flex items-center gap-1 bg-white/20 rounded-full px-2.5 py-0.5 text-xs text-white font-medium">
                      {risk === 'Low' ? '🟢' : risk === 'Medium' ? '🟡' : '🔴'} Risk: {risk}
                    </span>
                    <span className="inline-flex items-center gap-1 bg-white/20 rounded-full px-2.5 py-0.5 text-xs text-white font-medium">
                      📚 Workload: {stats.total < 5 ? 'Light' : stats.total < 15 ? 'Moderate' : 'Heavy'}
                    </span>
                  </div>
                </div>
                <div className="w-16 h-16 rounded-2xl bg-white/10 flex items-center justify-center text-3xl">
                  🎓
                </div>
              </div>

              {/* Progress bar */}
              <div className="mt-4">
                <div className="flex justify-between text-xs text-primary-100 mb-1">
                  <span>Weekly progress</span><span>{score}%</span>
                </div>
                <div className="h-1.5 bg-white/20 rounded-full overflow-hidden">
                  <div className="h-full bg-white rounded-full animate-progress" style={{ width: `${score}%` }} />
                </div>
              </div>
            </Card>

            {/* ── Quick actions ── */}
            <div>
              <p className="text-xs font-semibold text-slate-400 dark:text-gray-500 uppercase tracking-widest mb-2 px-0.5">
                Quick Actions
              </p>
              <div className="grid grid-cols-4 gap-2">
                {quickActions.map(a => (
                  <button
                    key={a.screen}
                    onClick={() => go(a.screen)}
                    className="flex flex-col items-center gap-1.5 bg-white dark:bg-gray-900 border border-slate-100 dark:border-gray-800
                      rounded-2xl p-3 shadow-card active:scale-95 hover:shadow-card-lg transition-all duration-150"
                  >
                    <span className="text-2xl">{a.icon}</span>
                    <span className="text-[11px] font-semibold text-slate-700 dark:text-gray-200">{a.label}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* ── Today's AI focus ── */}
            <Card className="p-4" onClick={() => go('focus')}>
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-xl bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center text-xl flex-shrink-0">
                  ⚡
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <p className="text-xs font-semibold text-amber-500 uppercase tracking-wide">AI Recommended</p>
                    <svg className="w-4 h-4 text-slate-300 dark:text-gray-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="9 18 15 12 9 6"/></svg>
                  </div>
                  <p className="font-semibold text-slate-800 dark:text-white mt-0.5 text-sm leading-snug">
                    {tasks[0]?.title || 'No pending tasks'}
                  </p>
                  <p className="text-xs text-slate-400 dark:text-gray-500 mt-0.5">
                    {tasks[0] ? `${tasks[0].subject} · ${tasks[0].priority} priority` : 'Add tasks to get recommendations'}
                  </p>
                </div>
              </div>
            </Card>

            {/* ── Urgent tasks ── */}
            <div>
              <div className="flex items-center justify-between mb-2 px-0.5">
                <p className="text-xs font-semibold text-slate-400 dark:text-gray-500 uppercase tracking-widest">
                  Urgent Tasks
                </p>
                <button
                  onClick={() => go('inbox')}
                  className="text-xs font-medium text-primary-600 dark:text-primary-400"
                >
                  View all
                </button>
              </div>
              <div className="space-y-2">
                {tasks.length === 0 ? (
                  <Card className="p-6 text-center">
                    <p className="text-4xl mb-2">📭</p>
                    <p className="text-sm text-slate-400 dark:text-gray-500">No urgent tasks</p>
                  </Card>
                ) : (
                  tasks.map(t => (
                    <Card key={t._id} className="p-3.5" onClick={() => go('task', t._id)}>
                      <div className="flex items-start gap-3">
                        <div className="w-8 h-8 rounded-lg bg-slate-100 dark:bg-gray-800 flex items-center justify-center text-base flex-shrink-0">
                          📖
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-slate-800 dark:text-white leading-snug">{t.title}</p>
                          <p className="text-xs text-slate-400 dark:text-gray-500 mt-0.5">
                            {t.subject} {t.deadline ? `· Due ${new Date(t.deadline).toLocaleDateString()}` : ''}
                          </p>
                        </div>
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full flex-shrink-0 ${priorityColor[t.priority] ?? ''}`}>
                          {t.priority}
                        </span>
                      </div>
                    </Card>
                  ))
                )}
              </div>
            </div>

            {/* ── Stats strip ── */}
            <div className="grid grid-cols-3 gap-2">
              {[
                { label: 'Tasks Due',   value: String(stats.dueSoon),  color: 'text-red-500',   bg: 'bg-red-50 dark:bg-red-900/20'   },
                { label: 'Completed',   value: String(stats.completed), color: 'text-green-500', bg: 'bg-green-50 dark:bg-green-900/20' },
                { label: 'Overdue',     value: String(stats.overdue),  color: 'text-amber-500', bg: 'bg-amber-50 dark:bg-amber-900/20' },
              ].map(s => (
                <div key={s.label} className={`${s.bg} rounded-2xl p-3 text-center border border-transparent`}>
                  <p className={`text-2xl font-extrabold ${s.color}`}>{s.value}</p>
                  <p className="text-[10px] font-medium text-slate-500 dark:text-gray-400 mt-0.5">{s.label}</p>
                </div>
              ))}
            </div>
          </>
        )}
      </main>

      {error && <Toast message={error} type="error" onClose={() => setError('')} />}
    </div>
  )
}
