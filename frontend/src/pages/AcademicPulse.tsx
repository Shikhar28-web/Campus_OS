import { useEffect, useState } from 'react'
import Header from '../components/Header'
import Card from '../components/Card'
import Spinner from '../components/Spinner'
import Toast from '../components/Toast'
import api from '../lib/api'

interface Subject {
  name: string
  score: number
  pendingAssignments: number
}

interface UpcomingItem {
  title: string
  date: string
  days: number
  type: string
}

interface PulseData {
  overallScore: number
  subjects: Subject[]
  upcoming: UpcomingItem[]
  weeklyActivity: number[]
  riskLevel: 'Low' | 'Medium' | 'High'
  stats: { total: number; completed: number; overdue: number; dueSoon: number }
}

const subjectColors: Record<string, { color: string; light: string; text: string }> = {
  Physics:     { color: 'bg-blue-500',   light: 'bg-blue-50 dark:bg-blue-900/20',   text: 'text-blue-600 dark:text-blue-400'   },
  Mathematics: { color: 'bg-purple-500', light: 'bg-purple-50 dark:bg-purple-900/20', text: 'text-purple-600 dark:text-purple-400' },
  Chemistry:   { color: 'bg-green-500',  light: 'bg-green-50 dark:bg-green-900/20',  text: 'text-green-600 dark:text-green-400'  },
  English:     { color: 'bg-amber-500',  light: 'bg-amber-50 dark:bg-amber-900/20',  text: 'text-amber-600 dark:text-amber-400'  },
}

const defaultSubjectColor = { color: 'bg-slate-500', light: 'bg-slate-50 dark:bg-slate-900/20', text: 'text-slate-600 dark:text-slate-400' }

function scoreColor(s: number) {
  if (s >= 80) return 'text-green-500'
  if (s >= 65) return 'text-amber-500'
  return 'text-red-500'
}

const typeEmoji: Record<string, string> = {
  Exam: '📝',
  Assignment: '🔢',
  Report: '🧪',
  Essay: '✍️',
  Lab: '🔬',
  Task: '📌',
}

export default function AcademicPulse() {
  const [pulse, setPulse] = useState<PulseData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    api.get('/pulse')
      .then((res) => {
        if (res.data.success) setPulse(res.data.data)
      })
      .catch((err) => {
        setError(err.response?.data?.error || 'Failed to load pulse data')
      })
      .finally(() => setLoading(false))
  }, [])

  const overall = pulse?.overallScore ?? 0
  const subjects = pulse?.subjects ?? []
  const upcoming = pulse?.upcoming ?? []
  const weeklyActivity = pulse?.weeklyActivity ?? [0, 0, 0, 0, 0, 0, 0]
  const stats = pulse?.stats ?? { total: 0, completed: 0, overdue: 0, dueSoon: 0 }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-gray-950">
      <Header title="Academic Pulse" subtitle="Performance tracker" />

      <main className="max-w-lg mx-auto px-4 pt-4 pb-6 space-y-4">
        {loading ? (
          <div className="flex justify-center py-12">
            <Spinner size="lg" />
          </div>
        ) : (
          <>
            {/* Overall score card */}
            <Card gradient className="p-5">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-primary-100 text-sm font-medium">Overall Pulse Score</p>
                  <div className="flex items-end gap-2 mt-1">
                    <span className="text-5xl font-extrabold text-white">{overall}</span>
                    <span className="text-primary-200 mb-1.5">/ 100</span>
                  </div>
                  <div className="flex gap-2 mt-2 flex-wrap">
                    <span className="bg-white/20 text-white text-[10px] font-semibold px-2.5 py-0.5 rounded-full">
                      🔴 {stats.overdue} Overdue
                    </span>
                    <span className="bg-white/20 text-white text-[10px] font-semibold px-2.5 py-0.5 rounded-full">
                      🟡 {stats.dueSoon} Due Soon
                    </span>
                    <span className="bg-white/20 text-white text-[10px] font-semibold px-2.5 py-0.5 rounded-full">
                      ✅ {stats.completed} Done
                    </span>
                  </div>
                </div>
                <div className="text-5xl">📊</div>
              </div>
            </Card>

            {/* Subject performance */}
            {subjects.length > 0 && (
              <div>
                <p className="text-xs font-bold text-slate-400 dark:text-gray-500 uppercase tracking-widest mb-2 px-0.5">
                  By Subject
                </p>
                <div className="space-y-2.5">
                  {subjects.map(s => {
                    const colors = subjectColors[s.name] || defaultSubjectColor
                    return (
                      <Card key={s.name} className="p-4">
                        <div className="flex items-center gap-3">
                          <div className={`w-10 h-10 rounded-xl ${colors.light} flex items-center justify-center flex-shrink-0`}>
                            <span className={`text-sm font-extrabold ${colors.text}`}>{s.name[0]}</span>
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between mb-1.5">
                              <p className="text-sm font-semibold text-slate-700 dark:text-gray-200">{s.name}</p>
                              <span className={`text-sm font-bold ${scoreColor(s.score)}`}>{s.score}%</span>
                            </div>
                            <div className="h-1.5 bg-slate-100 dark:bg-gray-800 rounded-full overflow-hidden">
                              <div
                                className={`h-full ${colors.color} rounded-full animate-progress`}
                                style={{ width: `${s.score}%` }}
                              />
                            </div>
                            <p className="text-[10px] text-slate-400 dark:text-gray-500 mt-1">
                              {s.pendingAssignments} pending assignment{s.pendingAssignments !== 1 ? 's' : ''}
                            </p>
                          </div>
                        </div>
                      </Card>
                    )
                  })}
                </div>
              </div>
            )}

            {/* Upcoming deadlines */}
            {upcoming.length > 0 && (
              <div>
                <p className="text-xs font-bold text-slate-400 dark:text-gray-500 uppercase tracking-widest mb-2 px-0.5">
                  Upcoming Deadlines
                </p>
                <div className="space-y-2">
                  {upcoming.map((u, i) => (
                    <Card key={i} className="p-3.5">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-xl bg-slate-100 dark:bg-gray-800 flex items-center justify-center text-lg flex-shrink-0">
                          {typeEmoji[u.type] || '📌'}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-slate-800 dark:text-white leading-tight">{u.title}</p>
                          <p className="text-[10px] text-slate-400 dark:text-gray-500 mt-0.5">
                            {u.type} · {new Date(u.date).toLocaleDateString()}
                          </p>
                        </div>
                        <div className={`text-center flex-shrink-0 rounded-xl px-2.5 py-1
                          ${u.days <= 5 ? 'bg-red-100 dark:bg-red-900/30' : 'bg-slate-100 dark:bg-gray-800'}`}>
                          <p className={`text-base font-extrabold leading-none ${u.days <= 5 ? 'text-red-500' : 'text-slate-600 dark:text-gray-300'}`}>{u.days}</p>
                          <p className="text-[9px] text-slate-400 dark:text-gray-500 leading-none mt-0.5">days</p>
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>
              </div>
            )}

            {/* Weekly activity */}
            <Card className="p-4">
              <p className="text-xs font-bold text-slate-400 dark:text-gray-500 uppercase tracking-widest mb-3">
                Weekly Activity
              </p>
              <div className="flex items-end gap-1.5 h-16">
                {weeklyActivity.map((h, i) => (
                  <div key={i} className="flex-1 flex flex-col items-center gap-1">
                    <div
                      className="w-full bg-primary-500 rounded-t-sm opacity-80 hover:opacity-100 transition-opacity"
                      style={{ height: `${h}%` }}
                    />
                    <span className="text-[9px] text-slate-400 dark:text-gray-600">
                      {['S','M','T','W','T','F','S'][i]}
                    </span>
                  </div>
                ))}
              </div>
            </Card>
          </>
        )}
      </main>

      {error && <Toast message={error} type="error" onClose={() => setError('')} />}
    </div>
  )
}
