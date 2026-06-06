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

function getDaysLeft(deadline: string | null): number | null {
  if (!deadline) return null
  return Math.ceil((new Date(deadline).getTime() - Date.now()) / (1000 * 60 * 60 * 24))
}

function getRecommendation(tasks: Task[]): string {
  if (tasks.length === 0) return '🎉 No pending tasks — you\'re all caught up!'

  const overdue = tasks.filter(t => t.deadline && getDaysLeft(t.deadline)! < 0)
  const dueSoon = tasks.filter(t => t.deadline && getDaysLeft(t.deadline)! >= 0 && getDaysLeft(t.deadline)! <= 2)
  const high    = tasks.filter(t => t.priority === 'High')

  if (overdue.length > 0)
    return `🚨 You have ${overdue.length} overdue task${overdue.length > 1 ? 's' : ''}! Complete them now to boost your Academic Pulse.`
  if (dueSoon.length > 0)
    return `⏰ ${dueSoon[0].title} is due in ${getDaysLeft(dueSoon[0].deadline!)} day${getDaysLeft(dueSoon[0].deadline!) === 1 ? '' : 's'}. Complete it early to improve your Pulse score!`
  if (high.length > 0)
    return `⚡ Complete high-priority tasks first — each one boosts your Academic Pulse by ~15 points!`
  if (tasks.length >= 5)
    return `📚 You have ${tasks.length} pending tasks. Finishing them early will keep your Academic Pulse in the green zone!`
  return `✅ You're doing great! Complete pending tasks consistently to maintain a high Pulse score.`
}

export default function FocusEngine() {
  const [selectedMins, setSelectedMins] = useState(25)
  const [running, setRunning]     = useState(false)
  const [seconds, setSeconds]     = useState(25 * 60)
  const [focusData, setFocusData] = useState<FocusData | null>(null)
  const [tasks, setTasks]         = useState<Task[]>([])
  const [activeTask, setActiveTask] = useState<string>('')
  const [loading, setLoading]     = useState(true)
  const [completing, setCompleting] = useState(false)
  const [error, setError]         = useState('')
  const [success, setSuccess]     = useState('')
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null)

  useEffect(() => {
    loadData()
  }, [])

  const loadData = () => {
    setLoading(true)
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
        setError(err.response?.data?.error || 'Failed to load focus data. Check that the backend is running on port 5000.')
      })
      .finally(() => setLoading(false))
  }

  const handleCompleteTask = async () => {
    if (!activeTask) {
      setError('Please select a task to mark as complete')
      return
    }
    setCompleting(true)
    try {
      const res = await api.patch(`/tasks/${activeTask}`, { status: 'completed' })
      if (res.data.success) {
        // Remove from list
        const completedTask = tasks.find(t => t._id === activeTask)
        setTasks(prev => prev.filter(t => t._id !== activeTask))
        setSuccess(`✅ "${completedTask?.title}" completed! Your Academic Pulse has been updated.`)
        // Pick next task
        const remaining = tasks.filter(t => t._id !== activeTask)
        if (remaining.length > 0) setActiveTask(remaining[0]._id)
        else setActiveTask('')
        // Reset timer
        setRunning(false)
        setSeconds(selectedMins * 60)
      }
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to complete task. Please try again.')
    } finally {
      setCompleting(false)
    }
  }

  const total    = selectedMins * 60
  const progress = 1 - seconds / total
  const radius   = 54
  const circ     = 2 * Math.PI * radius
  const dash     = circ * (1 - progress)

  useEffect(() => {
    if (running) {
      intervalRef.current = setInterval(() => {
        setSeconds(s => {
          if (s <= 1) {
            clearInterval(intervalRef.current!)
            setRunning(false)
            setSuccess('🎉 Focus session complete! Great work — ready to mark task as done?')
            return 0
          }
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

  const activeTaskData = tasks.find(t => t._id === activeTask)
  const recommendation = getRecommendation(tasks)
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
            {/* AI Recommendation banner */}
            <Card className="p-4 bg-gradient-to-r from-amber-50 to-orange-50 dark:from-amber-900/20 dark:to-orange-900/20 border border-amber-200 dark:border-amber-800">
              <div className="flex items-start gap-3">
                <span className="text-xl flex-shrink-0">🤖</span>
                <div>
                  <p className="text-[10px] font-bold text-amber-600 dark:text-amber-400 uppercase tracking-wide mb-1">
                    Smart Recommendation
                  </p>
                  <p className="text-xs text-amber-800 dark:text-amber-200 leading-relaxed">
                    {recommendation}
                  </p>
                </div>
              </div>
            </Card>

            {/* AI Recommended task */}
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

                {/* Active task label above timer */}
                {activeTaskData && (
                  <div className="mb-3 text-center">
                    <p className="text-[10px] font-bold text-slate-400 dark:text-gray-500 uppercase tracking-widest">Now Focusing On</p>
                    <p className="text-sm font-semibold text-slate-700 dark:text-gray-200 mt-0.5 max-w-[220px] truncate">
                      {activeTaskData.title}
                    </p>
                  </div>
                )}

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

                {/* Timer controls */}
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
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                        <rect x="6" y="4" width="4" height="16"/><rect x="14" y="4" width="4" height="16"/>
                      </svg>
                    ) : (
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                        <polygon points="5 3 19 12 5 21 5 3"/>
                      </svg>
                    )}
                  </button>
                  <button className="w-11 h-11 rounded-full bg-slate-100 dark:bg-gray-800 flex items-center justify-center text-slate-500 dark:text-gray-400 hover:bg-slate-200 dark:hover:bg-gray-700 transition-colors">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M9 18V5l12-2v13"/><circle cx="6" cy="18" r="3"/><circle cx="18" cy="16" r="3"/>
                    </svg>
                  </button>
                </div>

                {/* ── COMPLETE TASK BUTTON ── */}
                {activeTask && (
                  <div className="mt-5 w-full">
                    <button
                      onClick={handleCompleteTask}
                      disabled={completing || running}
                      className="w-full flex items-center justify-center gap-2 bg-green-500 hover:bg-green-600 active:scale-95
                        disabled:opacity-50 disabled:cursor-not-allowed
                        text-white font-bold text-sm py-3.5 rounded-2xl
                        shadow-lg shadow-green-500/30 transition-all duration-200"
                    >
                      {completing ? (
                        <>
                          <Spinner size="sm" className="!text-white" />
                          <span>Completing…</span>
                        </>
                      ) : (
                        <>
                          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                            <polyline points="20 6 9 17 4 12"/>
                          </svg>
                          <span>
                            Mark as Complete
                            {running && <span className="text-green-200 text-xs font-normal ml-1">(stop timer first)</span>}
                          </span>
                        </>
                      )}
                    </button>
                    {running && (
                      <p className="text-center text-[10px] text-slate-400 dark:text-gray-500 mt-1.5">
                        ⏸ Pause the timer before completing
                      </p>
                    )}
                    {!running && activeTaskData && (
                      <p className="text-center text-[10px] text-green-600 dark:text-green-400 mt-1.5 font-medium">
                        +15 pts to Academic Pulse 🎯
                      </p>
                    )}
                  </div>
                )}
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
              <div className="flex items-center justify-between mb-2 px-0.5">
                <p className="text-xs font-bold text-slate-400 dark:text-gray-500 uppercase tracking-widest">
                  Choose Task
                </p>
                <span className="text-[10px] text-slate-400 dark:text-gray-500">
                  {tasks.length} pending
                </span>
              </div>
              <div className="space-y-2">
                {tasks.length === 0 ? (
                  <Card className="p-6 text-center">
                    <p className="text-4xl mb-2">🏆</p>
                    <p className="text-sm font-semibold text-green-600 dark:text-green-400">All tasks completed!</p>
                    <p className="text-xs text-slate-400 dark:text-gray-500 mt-1">Your Academic Pulse is at its peak</p>
                  </Card>
                ) : (
                  tasks.map(t => {
                    const daysLeft = getDaysLeft(t.deadline)
                    const isUrgent = daysLeft !== null && daysLeft <= 2
                    return (
                      <Card
                        key={t._id}
                        className={`p-3.5 cursor-pointer transition-all ${
                          activeTask === t._id
                            ? 'ring-2 ring-primary-400 dark:ring-primary-500'
                            : ''
                        }`}
                        onClick={() => setActiveTask(t._id)}
                      >
                        <div className="flex items-start gap-3">
                          <div className={`w-4 h-4 rounded-full border-2 mt-0.5 flex-shrink-0 transition-colors
                            ${activeTask === t._id ? 'bg-primary-500 border-primary-500' : 'border-slate-300 dark:border-gray-600'}`}
                          />
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-slate-800 dark:text-white">{t.title}</p>
                            <div className="flex items-center gap-2 mt-0.5 flex-wrap">
                              <span className="text-[10px] text-slate-400 dark:text-gray-500">{t.subject}</span>
                              <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-medium ${
                                t.priority === 'High'
                                  ? 'bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400'
                                  : t.priority === 'Medium'
                                  ? 'bg-amber-100 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400'
                                  : 'bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400'
                              }`}>
                                {t.priority === 'High' ? '⚡' : t.priority === 'Medium' ? '📅' : '🔁'} {t.priority}
                              </span>
                              {daysLeft !== null && (
                                <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-medium ${
                                  isUrgent
                                    ? 'bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400'
                                    : 'bg-slate-100 dark:bg-gray-800 text-slate-500 dark:text-gray-400'
                                }`}>
                                  {daysLeft < 0 ? `${Math.abs(daysLeft)}d overdue` : daysLeft === 0 ? 'Due today' : `${daysLeft}d left`}
                                </span>
                              )}
                            </div>
                          </div>
                          {activeTask === t._id && (
                            <span className="text-[9px] font-bold text-primary-500 dark:text-primary-400 flex-shrink-0 bg-primary-50 dark:bg-primary-900/30 px-1.5 py-0.5 rounded-full">
                              ACTIVE
                            </span>
                          )}
                        </div>
                      </Card>
                    )
                  })
                )}
              </div>
            </div>
          </>
        )}
      </main>

      {error   && <Toast message={error}   type="error"   onClose={() => setError('')} />}
      {success && <Toast message={success} type="success" onClose={() => setSuccess('')} />}
    </div>
  )
}
