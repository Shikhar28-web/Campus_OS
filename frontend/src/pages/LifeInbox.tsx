import { useState } from 'react'
import Header from '../components/Header'
import Card from '../components/Card'

interface InboxItem {
  id: string
  kind: 'Screenshot' | 'PDF' | 'Voice' | 'Manual'
  status: 'New' | 'Processed' | 'Archived'
  extracted: string
  time: string
  emoji: string
}

const ITEMS: InboxItem[] = [
  { id: 'i1', kind: 'Screenshot', status: 'New',       extracted: 'Submit assignment form before Friday 5 PM',  time: '2h ago',  emoji: '📸' },
  { id: 'i2', kind: 'PDF',        status: 'Processed', extracted: 'Exam Notice: Physics — 12 June, Hall B',     time: '5h ago',  emoji: '📄' },
  { id: 'i3', kind: 'Voice',      status: 'Processed', extracted: 'Buy lab coat and safety goggles',            time: '1d ago',  emoji: '🎤' },
  { id: 'i4', kind: 'Manual',     status: 'Archived',  extracted: 'Register for tech fest by June 8',           time: '2d ago',  emoji: '✍️' },
]

const statusStyle: Record<string, string> = {
  New:       'bg-primary-100 text-primary-600 dark:bg-primary-900/30 dark:text-primary-400',
  Processed: 'bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400',
  Archived:  'bg-slate-100 text-slate-400 dark:bg-gray-800 dark:text-gray-500',
}

const TABS = ['All', 'New', 'Processed', 'Archived'] as const
type Tab = typeof TABS[number]

export default function LifeInbox() {
  const [tab, setTab] = useState<Tab>('All')

  const filtered = tab === 'All' ? ITEMS : ITEMS.filter(i => i.status === tab)

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-gray-950">
      <Header title="Life Inbox" subtitle="Captured inputs" />

      <main className="max-w-lg mx-auto px-4 pt-4 pb-6 space-y-4">

        {/* Upload strip */}
        <div className="grid grid-cols-3 gap-2">
          {[
            { icon: '📸', label: 'Scan Screenshot' },
            { icon: '📄', label: 'Upload PDF'       },
            { icon: '✍️', label: 'Add Manually'     },
          ].map(a => (
            <button
              key={a.label}
              className="flex flex-col items-center gap-1.5 bg-white dark:bg-gray-900 border border-dashed border-slate-200 dark:border-gray-700
                rounded-2xl py-3 px-2 text-center active:scale-95 transition-all"
            >
              <span className="text-2xl">{a.icon}</span>
              <span className="text-[10px] font-medium text-slate-500 dark:text-gray-400 leading-tight">{a.label}</span>
            </button>
          ))}
        </div>

        {/* Filter tabs */}
        <div className="flex gap-2 overflow-x-auto scrollbar-hide pb-1">
          {TABS.map(t => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`flex-shrink-0 text-xs font-semibold px-3.5 py-1.5 rounded-full transition-all
                ${tab === t
                  ? 'bg-primary-500 text-white shadow-sm'
                  : 'bg-white dark:bg-gray-900 text-slate-500 dark:text-gray-400 border border-slate-200 dark:border-gray-700'
                }`}
            >
              {t}
              {t !== 'All' && (
                <span className="ml-1 opacity-70">{ITEMS.filter(i => i.status === t).length}</span>
              )}
            </button>
          ))}
        </div>

        {/* Items */}
        <div className="space-y-2.5">
          {filtered.map(item => (
            <Card key={item.id} className="p-4" onClick={() => {}}>
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-xl bg-slate-100 dark:bg-gray-800 flex items-center justify-center text-xl flex-shrink-0">
                  {item.emoji}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <p className="text-sm font-medium text-slate-800 dark:text-white leading-snug">{item.extracted}</p>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full flex-shrink-0 ${statusStyle[item.status]}`}>
                      {item.status}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 mt-1.5">
                    <span className="text-[10px] bg-slate-100 dark:bg-gray-800 text-slate-500 dark:text-gray-400 px-2 py-0.5 rounded-full font-medium">
                      {item.kind}
                    </span>
                    <span className="text-[10px] text-slate-400 dark:text-gray-500">{item.time}</span>
                  </div>
                </div>
              </div>
            </Card>
          ))}
        </div>

        {filtered.length === 0 && (
          <div className="text-center py-12">
            <p className="text-4xl mb-3">📭</p>
            <p className="text-sm font-medium text-slate-400 dark:text-gray-500">Nothing here yet</p>
          </div>
        )}

      </main>
    </div>
  )
}
