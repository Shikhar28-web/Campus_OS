import { useState, createContext, useContext } from 'react'
import Dashboard from './pages/Dashboard'
import LifeInbox from './pages/LifeInbox'
import FocusEngine from './pages/FocusEngine'
import AcademicPulse from './pages/AcademicPulse'
import TaskDetails from './pages/TaskDetails'
import VoiceCapture from './pages/VoiceCapture'

export type Screen = 'dashboard' | 'inbox' | 'focus' | 'pulse' | 'task' | 'voice'

/* ── Theme context ──────────────────────────────────── */
type ThemeCtx = { dark: boolean; toggle: () => void }
export const ThemeContext = createContext<ThemeCtx>({ dark: false, toggle: () => {} })
export const useTheme = () => useContext(ThemeContext)

/* ── Nav context (lets child pages navigate) ─────── */
type NavCtx = { screen: Screen; go: (s: Screen) => void }
export const NavContext = createContext<NavCtx>({ screen: 'dashboard', go: () => {} })
export const useNav = () => useContext(NavContext)

/* ── Nav items ──────────────────────────────────────── */
const NAV = [
  { id: 'dashboard', label: 'Home',   icon: HomeIcon   },
  { id: 'inbox',     label: 'Inbox',  icon: InboxIcon  },
  { id: 'focus',     label: 'Focus',  icon: ZapIcon    },
  { id: 'pulse',     label: 'Pulse',  icon: PulseIcon  },
  { id: 'voice',     label: 'Voice',  icon: MicIcon    },
] as const

export default function App() {
  const [dark, setDark]     = useState(false)
  const [screen, setScreen] = useState<Screen>('dashboard')

  const toggle = () => setDark(d => !d)
  const go     = (s: Screen) => setScreen(s)

  return (
    <ThemeContext.Provider value={{ dark, toggle }}>
      <NavContext.Provider value={{ screen, go }}>
        <div className={dark ? 'dark' : ''}>
          <div className="min-h-screen bg-slate-50 dark:bg-gray-950 font-sans">

            {/* ── Page content ── */}
            <div className="pb-20">
              {screen === 'dashboard' && <Dashboard />}
              {screen === 'inbox'     && <LifeInbox />}
              {screen === 'focus'     && <FocusEngine />}
              {screen === 'pulse'     && <AcademicPulse />}
              {screen === 'task'      && <TaskDetails />}
              {screen === 'voice'     && <VoiceCapture />}
            </div>

            {/* ── Bottom nav ── */}
            <nav className="fixed bottom-0 inset-x-0 z-50 bg-white/90 dark:bg-gray-900/90 glass border-t border-slate-200 dark:border-gray-800 safe-area">
              <div className="max-w-lg mx-auto flex items-center justify-around h-16 px-2">
                {NAV.map(({ id, label, icon: Icon }) => {
                  const active = screen === id
                  return (
                    <button
                      key={id}
                      onClick={() => go(id as Screen)}
                      className={`flex flex-col items-center gap-0.5 px-3 py-1 rounded-xl transition-all duration-200
                        ${active
                          ? 'text-primary-600 dark:text-primary-400'
                          : 'text-slate-400 dark:text-gray-500 hover:text-slate-600 dark:hover:text-gray-300'
                        }`}
                    >
                      <span className={`relative flex items-center justify-center w-8 h-8 rounded-xl transition-all duration-200
                        ${active ? 'bg-primary-100 dark:bg-primary-900/40' : ''}`}>
                        <Icon size={20} />
                      </span>
                      <span className={`text-[10px] font-medium leading-none ${active ? 'font-semibold' : ''}`}>
                        {label}
                      </span>
                    </button>
                  )
                })}
              </div>
            </nav>

          </div>
        </div>
      </NavContext.Provider>
    </ThemeContext.Provider>
  )
}

/* ── Inline SVG icons (no extra dep) ──────────────── */
function HomeIcon({ size = 20 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
      <polyline points="9 22 9 12 15 12 15 22"/>
    </svg>
  )
}
function InboxIcon({ size = 20 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="22 12 16 12 14 15 10 15 8 12 2 12"/>
      <path d="M5.45 5.11L2 12v6a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-6l-3.45-6.89A2 2 0 0 0 16.76 4H7.24a2 2 0 0 0-1.79 1.11z"/>
    </svg>
  )
}
function ZapIcon({ size = 20 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/>
    </svg>
  )
}
function PulseIcon({ size = 20 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/>
    </svg>
  )
}
function MicIcon({ size = 20 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z"/>
      <path d="M19 10v2a7 7 0 0 1-14 0v-2"/>
      <line x1="12" y1="19" x2="12" y2="23"/>
      <line x1="8"  y1="23" x2="16" y2="23"/>
    </svg>
  )
}
