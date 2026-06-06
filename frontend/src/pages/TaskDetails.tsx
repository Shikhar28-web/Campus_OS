import { useNav } from '../App'
import Header from '../components/Header'
import Card from '../components/Card'
import { tasks } from '../data/mock'

const priorityColor: Record<string, string> = {
  High:   'bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400',
  Medium: 'bg-amber-100 text-amber-600 dark:bg-amber-900/30 dark:text-amber-400',
  Low:    'bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400',
}

const STEPS = [
  { label: 'Read introduction and objectives', done: true  },
  { label: 'Understand key thermodynamic laws', done: true  },
  { label: 'Take notes on equations',           done: false },
  { label: 'Solve practice problems',           done: false },
  { label: 'Review and summarise',              done: false },
]

export default function TaskDetails({ id }: { id?: string }) {
  const { go } = useNav()
  const task = tasks[0]
  const doneCount = STEPS.filter(s => s.done).length

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

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-gray-950">
      <Header title="Task Details" subtitle="Full breakdown" right={BackBtn} />

      <main className="max-w-lg mx-auto px-4 pt-4 pb-6 space-y-4">

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
            { icon: '📅', label: 'Deadline', value: task.deadline  },
            { icon: '📌', label: 'Source',   value: task.source    },
          ].map(m => (
            <Card key={m.label} className="p-3.5">
              <p className="text-xl mb-1">{m.icon}</p>
              <p className="text-[10px] text-slate-400 dark:text-gray-500 font-semibold uppercase tracking-wide">{m.label}</p>
              <p className="text-sm font-semibold text-slate-700 dark:text-gray-200 mt-0.5">{m.value}</p>
            </Card>
          ))}
        </div>

        {/* Progress */}
        <Card className="p-4">
          <div className="flex items-center justify-between mb-2">
            <p className="text-xs font-bold text-slate-400 dark:text-gray-500 uppercase tracking-widest">Progress</p>
            <p className="text-xs font-bold text-primary-500">{doneCount}/{STEPS.length} steps</p>
          </div>
          <div className="h-2 bg-slate-100 dark:bg-gray-800 rounded-full overflow-hidden mb-4">
            <div
              className="h-full bg-primary-500 rounded-full animate-progress"
              style={{ width: `${(doneCount / STEPS.length) * 100}%` }}
            />
          </div>
          <div className="space-y-2.5">
            {STEPS.map((s, i) => (
              <div key={i} className="flex items-start gap-2.5">
                <div className={`w-5 h-5 rounded-full border-2 mt-0.5 flex-shrink-0 flex items-center justify-center
                  ${s.done ? 'bg-primary-500 border-primary-500' : 'border-slate-300 dark:border-gray-600'}`}>
                  {s.done && (
                    <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                      <polyline points="20 6 9 17 4 12"/>
                    </svg>
                  )}
                </div>
                <p className={`text-sm leading-snug ${s.done ? 'line-through text-slate-400 dark:text-gray-600' : 'text-slate-700 dark:text-gray-200'}`}>
                  {s.label}
                </p>
              </div>
            ))}
          </div>
        </Card>

        {/* AI Suggestion */}
        <Card className="p-4 border-l-4 border-l-purple-400">
          <p className="text-[10px] font-bold text-purple-500 uppercase tracking-wide mb-1">🤖 AI Insight</p>
          <p className="text-sm text-slate-700 dark:text-gray-200">
            You have a Physics exam in 6 days. Completing this task today increases your pulse score by ~8 points.
          </p>
        </Card>

        {/* Actions */}
        <div className="flex gap-2 pt-1">
          <button className="flex-1 bg-primary-500 hover:bg-primary-600 active:scale-95 text-white font-semibold text-sm py-3 rounded-2xl transition-all shadow-lg shadow-primary-500/20">
            Start Focusing
          </button>
          <button className="px-5 bg-white dark:bg-gray-900 border border-slate-200 dark:border-gray-700 text-slate-500 dark:text-gray-400 font-semibold text-sm py-3 rounded-2xl hover:bg-slate-50 dark:hover:bg-gray-800 transition-all">
            Reschedule
          </button>
        </div>

      </main>
    </div>
  )
}
