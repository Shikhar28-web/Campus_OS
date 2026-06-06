import React, { useState } from 'react'
import Dashboard from './pages/Dashboard'
import LifeInbox from './pages/LifeInbox'
import FocusEngine from './pages/FocusEngine'
import AcademicPulse from './pages/AcademicPulse'
import TaskDetails from './pages/TaskDetails'
import VoiceCapture from './pages/VoiceCapture'

type Screen = 'dashboard' | 'inbox' | 'focus' | 'pulse' | 'task' | 'voice'

export default function App() {
  const [screen, setScreen] = useState<Screen>('dashboard')

  return (
    <div className="min-h-screen bg-bg">
      {screen === 'dashboard' && <Dashboard />}
      {screen === 'inbox' && <LifeInbox />}
      {screen === 'focus' && <FocusEngine />}
      {screen === 'pulse' && <AcademicPulse />}
      {screen === 'task' && <TaskDetails />}
      {screen === 'voice' && <VoiceCapture />}

      <footer className="fixed bottom-0 left-0 right-0 bg-bg border-t border-gray-100 py-3">
        <div className="max-w-lg mx-auto px-4 flex justify-between">
          <button onClick={() => setScreen('dashboard')} className="text-sm">Home</button>
          <button onClick={() => setScreen('inbox')} className="text-sm">Inbox</button>
          <button onClick={() => setScreen('focus')} className="text-sm">Focus</button>
          <button onClick={() => setScreen('pulse')} className="text-sm">Pulse</button>
          <button onClick={() => setScreen('voice')} className="text-sm">Voice</button>
        </div>
      </footer>
    </div>
  )
}
