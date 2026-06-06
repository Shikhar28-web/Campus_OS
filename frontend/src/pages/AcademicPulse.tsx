import Header from '../components/Header'
import Card from '../components/Card'

const SUBJECTS = [
  { name: 'Physics',      score: 82, assignments: 3, color: 'bg-blue-500',   light: 'bg-blue-50 dark:bg-blue-900/20',   text: 'text-blue-600 dark:text-blue-400'   },
  { name: 'Mathematics',  score: 70, assignments: 5, color: 'bg-purple-500', light: 'bg-purple-50 dark:bg-purple-900/20', text: 'text-purple-600 dark:text-purple-400' },
  { name: 'Chemistry',    score: 88, assignments: 1, color: 'bg-green-500',  light: 'bg-green-50 dark:bg-green-900/20',  text: 'text-green-600 dark:text-green-400'  },
  { name: 'English',      score: 60, assignments: 4, color: 'bg-amber-500',  light: 'bg-amber-50 dark:bg-amber-900/20',  text: 'text-amber-600 dark:text-amber-400'  },
]

const UPCOMING = [
  { title: 'Physics Mid-term',       date: 'Jun 12', days: 6,  type: 'Exam',       emoji: '📝' },
  { title: 'Math Problem Set 3',     date: 'Jun 10', days: 4,  type: 'Assignment', emoji: '🔢' },
  { title: 'Chemistry Lab Report',   date: 'Jun 15', days: 9,  type: 'Report',     emoji: '🧪' },
  { title: 'English Essay Draft',    date: 'Jun 18', days: 12, type: 'Essay',      emoji: '✍️' },
]

function scoreColor(s: number) {
  if (s >= 80) return 'text-green-500'
  if (s >= 65) return 'text-amber-500'
  return 'text-red-500'
}

export default function AcademicPulse() {
  const overall = Math.round(SUBJECTS.reduce((a, s) => a + s.score, 0) / SUBJECTS.length)

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-gray-950">
      <Header title="Academic Pulse" subtitle="Performance tracker" />

      <main className="max-w-lg mx-auto px-4 pt-4 pb-6 space-y-4">

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
                <span className="bg-white/20 text-white text-[10px] font-semibold px-2.5 py-0.5 rounded-full">🔴 2 Overdue</span>
                <span className="bg-white/20 text-white text-[10px] font-semibold px-2.5 py-0.5 rounded-full">🟡 4 Due Soon</span>
                <span className="bg-white/20 text-white text-[10px] font-semibold px-2.5 py-0.5 rounded-full">✅ 12 Done</span>
              </div>
            </div>
            <div className="text-5xl">📊</div>
          </div>
        </Card>

        {/* Subject performance */}
        <div>
          <p className="text-xs font-bold text-slate-400 dark:text-gray-500 uppercase tracking-widest mb-2 px-0.5">
            By Subject
          </p>
          <div className="space-y-2.5">
            {SUBJECTS.map(s => (
              <Card key={s.name} className="p-4">
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-xl ${s.light} flex items-center justify-center flex-shrink-0`}>
                    <span className={`text-sm font-extrabold ${s.text}`}>{s.name[0]}</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-1.5">
                      <p className="text-sm font-semibold text-slate-700 dark:text-gray-200">{s.name}</p>
                      <span className={`text-sm font-bold ${scoreColor(s.score)}`}>{s.score}%</span>
                    </div>
                    <div className="h-1.5 bg-slate-100 dark:bg-gray-800 rounded-full overflow-hidden">
                      <div
                        className={`h-full ${s.color} rounded-full animate-progress`}
                        style={{ width: `${s.score}%` }}
                      />
                    </div>
                    <p className="text-[10px] text-slate-400 dark:text-gray-500 mt-1">
                      {s.assignments} pending assignment{s.assignments !== 1 ? 's' : ''}
                    </p>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>

        {/* Upcoming deadlines */}
        <div>
          <p className="text-xs font-bold text-slate-400 dark:text-gray-500 uppercase tracking-widest mb-2 px-0.5">
            Upcoming Deadlines
          </p>
          <div className="space-y-2">
            {UPCOMING.map((u, i) => (
              <Card key={i} className="p-3.5">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-slate-100 dark:bg-gray-800 flex items-center justify-center text-lg flex-shrink-0">
                    {u.emoji}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-slate-800 dark:text-white leading-tight">{u.title}</p>
                    <p className="text-[10px] text-slate-400 dark:text-gray-500 mt-0.5">{u.type} · {u.date}</p>
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

        {/* Weekly activity */}
        <Card className="p-4">
          <p className="text-xs font-bold text-slate-400 dark:text-gray-500 uppercase tracking-widest mb-3">
            Weekly Activity
          </p>
          <div className="flex items-end gap-1.5 h-16">
            {[40, 65, 80, 55, 90, 70, 45].map((h, i) => (
              <div key={i} className="flex-1 flex flex-col items-center gap-1">
                <div
                  className="w-full bg-primary-500 rounded-t-sm opacity-80 hover:opacity-100 transition-opacity"
                  style={{ height: `${h}%` }}
                />
                <span className="text-[9px] text-slate-400 dark:text-gray-600">
                  {['M','T','W','T','F','S','S'][i]}
                </span>
              </div>
            ))}
          </div>
        </Card>

      </main>
    </div>
  )
}
