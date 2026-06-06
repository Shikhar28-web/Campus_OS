import { useState, useEffect, useRef } from 'react'
import Header from '../components/Header'
import Card from '../components/Card'
import Spinner from '../components/Spinner'
import Toast from '../components/Toast'
import api from '../lib/api'

interface Task {
  _id: string
  title: string
  subject: string
  priority: 'High' | 'Medium' | 'Low'
  deadline: string | null
}

interface ScheduleSlot {
  time: string
  label: string
  duration: string
}

interface FocusData {
  task: Task | null
  reason: string
  schedule: ScheduleSlot[]
}

const SESSIONS = [
  { label: '25 min', mins: 25, desc: 'Pomodoro' },
  { label: '45 min', mins: 45, desc: 'Deep work' },
  { label: '60 min', mins: 60, desc: 'Flow state' },
]

function fmt(s: number) {
  const m = Math.floor(s / 60).toString().padStart(2, '0')
  const sec = (s % 60).toString().padStart(2, '0')
  return `${m}:${sec}`
}

export default function FocusEngine() {
  const [selectedMins, setSelectedMins] = useState(25)
  const [running, setRunning]   = useState(false)
  const [seconds, setSeconds]   = useState(25 * 60)
  const [focusData, setFocusData] = useState<FocusData | null>(null)
  const [tasks, setTasks] = useState<Task[]>([])
  const [activeTask, setActiveTask] = useState<string>('')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null)

  useEffect(() => {
    Promise.all([
      api.get('/focus/recommend'),
      api.get('/tasks', { params: { status: 'pending' } }),
    ])
      .then(([focusRes, tasksRes]) => {
        if (focusRes.data.success) {
          setFocusData(focusRes.data.data)
          if (focusRes.data.data.task) {
            setActiveTask(focusRes.data.data.task._id)
          }
        }
        if (tasksRes.data.success) setTasks(tasksRes.data.data)
      })
      .catch((err) => {
        setError(err.response?.data?.error || 'Failed to load focus data')
      })
      .finally(() => setLoading(false))
  }, [])

  const total    = selectedMins * 60
  const progress = 1 - seconds / total
  const radius   = 54
  const circ     = 2 * Math.PI * radius
  const dash     = circ * (1 - progress)

  useEffect(() => {
    if (running) {
      intervalRef.current = setInterval(() => {
        setSeconds(s => {
          if (s <= 1) { clearInterval(intervalRef.current!); setRunning(false); return 0 }
          return s - 1
        })
      }, 1000)
    } else {
      if (intervalRef.current) clearInterval(intervalRef.current)
    }
    return () => { if (intervalRef.current) clearInterval(intervalRef.current) }
  }, [running])

  const handleSelect = (mins: number) => {
    if (running) return
    setSelectedMins(mins)
    setSeconds(mins * 60)
  }

  const handleReset = () => {
    setRunning(false)
    setSeconds(selectedMins * 60)
  }

  const scheduleColors = ['bg-primary-500', 'bg-green-500', 'bg-amber-500', 'bg-purple-500']

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-gray-950">
      <Header title="Focus Engine" subtitle="AI-powered study" />

      <main className="max-w-lg mx-auto px-4 pt-4 pb-6 space-y-4">
        {loading ? (
          <div className="flex justify-center py-12">
            <Spinner size="lg" />
          </div>
        ) : (
          <>
            {/* Recommended task banner */}
            <Card className="p-4 border-l-4 border-l-amber-400 dark:border-l-amber-500">
              <div className="flex items-start gap-3">
                <span className="text-2xl">⚡</span>
                <div>
                  <p className="text-[10px] font-bold text-amber-500 uppercase tracking-wide">AI Recommended</p>
                  <p className="text-sm font-semibold text-slate-800 dark:text-white mt-0.5">
                    {focusData?.task?.title || 'No tasks available'}
                  </p>
                  <p className="text-xs text-slate-400 dark:text-gray-500 mt-0.5">
                    {focusData?.reason || 'Add tasks to get a recommendation'}
                  </p>
                </div>
              </div>
            </Card>

            {/* Timer ring */}
            <Card className="p-6">
              <div className="flex flex-col items-center">
                <div className="relative">
                  <svg width="140" height="140" className="-rotate-90">
                    <circle cx="70" cy="70" r={radius} fill="none" stroke="currentColor"
                      className="text-slate-100 dark:text-gray-800" strokeWidth="8"/>
                    <circle cx="70" cy="70" r={radius} fill="none"
                      stroke="url(#grad)" strokeWidth="8"
                      strokeLinecap="round"
                      strokeDasharray={circ}
                      strokeDashoffset={dash}
                      className="transition-all duration-1000"
                    />
                    <defs>
                      <linearGradient id="grad" x1="0" y1="0" x2="1" y2="0">
                        <stop offset="0%" stopColor="#818cf8"/>
                        <stop offset="100%" stopColor="#6366f1"/>
                      </linearGradient>
                    </defs>
                  </svg>
                  <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <span className="text-3xl font-extrabold text-slate-800 dark:text-white tracking-tight">
                      {fmt(seconds)}
                    </span>
                    <span className="text-xs text-slate-400 dark:text-gray-500 mt-0.5">
                      {running ? 'Focusing…' : seconds === 0 ? 'Done! 🎉' : 'Ready'}
                    </span>
                  </div>
                </div>

                {/* Session presets */}
                <div className="flex gap-2 mt-5">
                  {SESSIONS.map(s => (
                    <button
                      key={s.mins}
                      onClick={() => handleSelect(s.mins)}
                      disabled={running}
                      className={`text-xs font-semibold px-3 py-1.5 rounded-full transition-all
                        ${selectedMins === s.mins
                          ? 'bg-primary-500 text-white'
                          : 'bg-slate-100 dark:bg-gray-800 text-slate-500 dark:text-gray-400 disabled:opacity-40'
                        }`}
                    >
                      {s.label}
                    </button>
                  ))}
                </div>

                {/* Controls */}
                <div className="flex gap-3 mt-5">
                  <button
                    onClick={handleReset}
                    className="w-11 h-11 rounded-full bg-slate-100 dark:bg-gray-800 flex items-center justify-center text-slate-500 dark:text-gray-400 hover:bg-slate-200 dark:hover:bg-gray-700 transition-colors"
                  >
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <polyline points="1 4 1 10 7 10"/><path d="M3.51 15a9 9 0 1 0 .49-3.5"/>
                    </svg>
                  </button>
                  <button
                    onClick={() => setRunning(r => !r)}
                    className="w-14 h-14 rounded-full bg-primary-500 hover:bg-primary-600 active:scale-95 flex items-center justify-center text-white shadow-lg shadow-primary-500/30 transition-all"
                  >
                    {running ? (
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><rect x="6" y="4" width="4" height="16"/><rect x="14" y="4" width="4" height="16"/></svg>
                    ) : (
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><polygon points="5 3 19 12 5 21 5 3"/></svg>
                    )}
                  </button>
                  <button className="w-11 h-11 rounded-full bg-slate-100 dark:bg-gray-800 flex items-center justify-center text-slate-500 dark:text-gray-400 hover:bg-slate-200 dark:hover:bg-gray-700 transition-colors">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M9 18V5l12-2v13"/><circle cx="6" cy="18" r="3"/><circle cx="18" cy="16" r="3"/>
                    </svg>
                  </button>
                </div>
              </div>
            </Card>

            {/* Suggested schedule */}
            {focusData?.schedule && focusData.schedule.length > 0 && (
              <Card className="p-4">
                <p className="text-xs font-bold text-slate-400 dark:text-gray-500 uppercase tracking-widest mb-3">
                  Suggested Schedule
                </p>
                <div className="space-y-2">
                  {focusData.schedule.map((slot, i) => (
                    <div key={i} className="flex items-center gap-3">
                      <span className="text-[11px] font-mono text-slate-400 dark:text-gray-500 w-10">{slot.time}</span>
                      <div className={`w-1 h-8 rounded-full ${scheduleColors[i % scheduleColors.length]} flex-shrink-0`}/>
                      <div className="flex-1">
                        <p className="text-xs font-medium text-slate-700 dark:text-gray-200">{slot.label}</p>
                      </div>
                      <span className="text-[10px] text-slate-400 dark:text-gray-500">{slot.duration}</span>
                    </div>
                  ))}
                </div>
              </Card>
            )}

            {/* Task switcher */}
            <div>
              <p className="text-xs font-bold text-slate-400 dark:text-gray-500 uppercase tracking-widest mb-2 px-0.5">
                Choose Task
              </p>
              <div className="space-y-2">
                {tasks.length === 0 ? (
                  <Card className="p-6 text-center">
                    <p className="text-4xl mb-2">📭</p>
                    <p className="text-sm text-slate-400 dark:text-gray-500">No pending tasks</p>
                  </Card>
                ) : (
                  tasks.map(t => (
                    <Card key={t._id} className={`p-3.5 ${activeTask === t._id ? 'ring-2 ring-primary-400 dark:ring-primary-500' : ''}`} onClick={() => setActiveTask(t._id)}>
                      <div className="flex items-start gap-3">
                        <div className={`w-4 h-4 rounded-full border-2 mt-0.5 flex-shrink-0 transition-colors
                          ${activeTask === t._id ? 'bg-primary-500 border-primary-500' : 'border-slate-300 dark:border-gray-600'}`}/>
                        <div>
                          <p className="text-sm font-medium text-slate-800 dark:text-white">{t.title}</p>
                          <div className="flex items-center gap-2 mt-0.5">
                            <span className="text-[10px] text-slate-400 dark:text-gray-500">{t.subject}</span>
                            <span className="text-[10px] bg-slate-100 dark:bg-gray-800 text-slate-500 dark:text-gray-400 px-1.5 py-0.5 rounded-full">
                              {t.priority === 'High' ? '⚡' : t.priority === 'Medium' ? '📅' : '🔁'} {t.priority}
                            </span>
                          </div>
                        </div>
                      </div>
                    </Card>
                  ))
                )}
              </div>
            </div>
          </>
        )}
      </main>

      {error && <Toast message={error} type="error" onClose={() => setError('')} />}
    </div>
  )
}
