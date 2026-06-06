import { useState } from 'react'
import Header from '../components/Header'
import Card from '../components/Card'

type RecordState = 'idle' | 'recording' | 'done'

const NOTES = [
  { id: 'v1', text: 'Buy lab coat and safety goggles before Wednesday',  time: '1d ago',  duration: '0:08' },
  { id: 'v2', text: 'Register for annual tech fest, deadline June 8',    time: '2d ago',  duration: '0:12' },
  { id: 'v3', text: 'Ask professor about extra credit assignment',        time: '3d ago',  duration: '0:06' },
]

export default function VoiceCapture() {
  const [state, setState] = useState<RecordState>('idle')
  const [seconds, setSeconds] = useState(0)
  const timerRef = { current: null as ReturnType<typeof setInterval> | null }

  const startRecord = () => {
    setState('recording')
    setSeconds(0)
    timerRef.current = setInterval(() => setSeconds(s => s + 1), 1000)
  }

  const stopRecord = () => {
    if (timerRef.current) clearInterval(timerRef.current)
    setState('done')
  }

  const reset = () => { setState('idle'); setSeconds(0) }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-gray-950">
      <Header title="Voice Capture" subtitle="Speak your tasks" />

      <main className="max-w-lg mx-auto px-4 pt-4 pb-6 space-y-4">

        {/* Record card */}
        <Card className="p-6">
          <div className="flex flex-col items-center">

            {/* Mic button */}
            <div className="relative mb-4">
              {state === 'recording' && (
                <span className="absolute inset-0 rounded-full bg-red-400 opacity-30 animate-ping" />
              )}
              <button
                onClick={state === 'idle' ? startRecord : state === 'recording' ? stopRecord : reset}
                className={`relative w-20 h-20 rounded-full flex items-center justify-center shadow-lg transition-all active:scale-95
                  ${state === 'recording'
                    ? 'bg-red-500 shadow-red-500/30'
                    : state === 'done'
                    ? 'bg-green-500 shadow-green-500/30'
                    : 'bg-primary-500 shadow-primary-500/30'
                  }`}
              >
                {state === 'recording' ? (
                  <svg width="28" height="28" viewBox="0 0 24 24" fill="white"><rect x="6" y="4" width="4" height="16"/><rect x="14" y="4" width="4" height="16"/></svg>
                ) : state === 'done' ? (
                  <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="20 6 9 17 4 12"/>
                  </svg>
                ) : (
                  <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z"/>
                    <path d="M19 10v2a7 7 0 0 1-14 0v-2"/>
                    <line x1="12" y1="19" x2="12" y2="23"/>
                    <line x1="8"  y1="23" x2="16" y2="23"/>
                  </svg>
                )}
              </button>
            </div>

            <p className="text-sm font-semibold text-slate-700 dark:text-gray-200">
              {state === 'idle'      ? 'Tap to record'   :
               state === 'recording' ? 'Recording…'      :
               'Recording saved!'}
            </p>

            {state === 'recording' && (
              <p className="text-2xl font-mono font-bold text-red-500 mt-1">
                {Math.floor(seconds / 60).toString().padStart(2,'0')}:{(seconds % 60).toString().padStart(2,'0')}
              </p>
            )}

            {state === 'done' && (
              <div className="flex gap-2 mt-4 w-full">
                <button className="flex-1 bg-primary-500 text-white text-sm font-semibold py-2.5 rounded-xl hover:bg-primary-600 active:scale-95 transition-all">
                  Save as Task
                </button>
                <button onClick={reset} className="px-4 bg-slate-100 dark:bg-gray-800 text-slate-500 dark:text-gray-400 text-sm font-semibold py-2.5 rounded-xl hover:bg-slate-200 dark:hover:bg-gray-700 transition-all">
                  Redo
                </button>
              </div>
            )}
          </div>
        </Card>

        {/* Upload option */}
        <button className="w-full flex items-center gap-3 bg-white dark:bg-gray-900 border border-dashed border-slate-300 dark:border-gray-700
          rounded-2xl px-4 py-3 text-left hover:bg-slate-50 dark:hover:bg-gray-800 transition-colors active:scale-[0.99]">
          <div className="w-10 h-10 rounded-xl bg-slate-100 dark:bg-gray-800 flex items-center justify-center text-xl flex-shrink-0">
            📁
          </div>
          <div>
            <p className="text-sm font-semibold text-slate-700 dark:text-gray-200">Upload Audio File</p>
            <p className="text-xs text-slate-400 dark:text-gray-500">MP3, M4A, WAV supported</p>
          </div>
          <svg className="w-4 h-4 text-slate-300 dark:text-gray-600 ml-auto" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="9 18 15 12 9 6"/></svg>
        </button>

        {/* How it works */}
        <Card className="p-4">
          <p className="text-xs font-bold text-slate-400 dark:text-gray-500 uppercase tracking-widest mb-3">How it works</p>
          <div className="space-y-3">
            {[
              { step: '1', text: 'Tap the mic and speak your note or task' },
              { step: '2', text: 'AI transcribes and extracts key info' },
              { step: '3', text: 'It lands in your Life Inbox automatically' },
            ].map(s => (
              <div key={s.step} className="flex items-start gap-3">
                <div className="w-6 h-6 rounded-full bg-primary-100 dark:bg-primary-900/30 flex items-center justify-center flex-shrink-0">
                  <span className="text-[10px] font-bold text-primary-600 dark:text-primary-400">{s.step}</span>
                </div>
                <p className="text-sm text-slate-600 dark:text-gray-300 leading-snug">{s.text}</p>
              </div>
            ))}
          </div>
        </Card>

        {/* Recent voice notes */}
        <div>
          <p className="text-xs font-bold text-slate-400 dark:text-gray-500 uppercase tracking-widest mb-2 px-0.5">
            Recent Notes
          </p>
          <div className="space-y-2">
            {NOTES.map(n => (
              <Card key={n.id} className="p-3.5">
                <div className="flex items-center gap-3">
                  <button className="w-8 h-8 rounded-full bg-primary-100 dark:bg-primary-900/30 flex items-center justify-center flex-shrink-0">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" className="text-primary-500 dark:text-primary-400" stroke="currentColor" strokeWidth="2">
                      <polygon points="5 3 19 12 5 21 5 3"/>
                    </svg>
                  </button>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-slate-700 dark:text-gray-200 font-medium leading-snug line-clamp-1">{n.text}</p>
                    <p className="text-[10px] text-slate-400 dark:text-gray-500 mt-0.5">{n.time} · {n.duration}</p>
                  </div>
                  <svg className="w-4 h-4 text-slate-300 dark:text-gray-600 flex-shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="9 18 15 12 9 6"/></svg>
                </div>
              </Card>
            ))}
          </div>
        </div>

      </main>
    </div>
  )
}
