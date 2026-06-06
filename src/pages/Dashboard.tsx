import React from 'react'
import Header from '../components/Header'
import Card from '../components/Card'
import { tasks } from '../data/mock'

export default function Dashboard() {
  return (
    <div className="min-h-screen safe-area">
      <Header title="Dashboard" />
      <main className="max-w-lg mx-auto px-4 py-4 space-y-4">
        <Card>
          <div className="flex items-center justify-between">
            <div>
              <div className="text-sm text-secondary">Academic Pulse</div>
              <div className="text-2xl font-semibold text-text">78</div>
            </div>
            <div className="text-sm text-secondary">Risk: Low</div>
          </div>
        </Card>

        <Card>
          <h3 className="font-medium">Today's Focus</h3>
          <p className="text-sm text-secondary mt-2">Finish the highest-priority task assigned by AI.</p>
        </Card>

        <Card>
          <h3 className="font-medium">Urgent Tasks</h3>
          <ul className="mt-3 space-y-3">
            {tasks.map(t => (
              <li key={t.id} className="flex justify-between">
                <div>
                  <div className="font-medium">{t.title}</div>
                  <div className="text-sm text-secondary">{t.subject} • {t.deadline}</div>
                </div>
                <div className="text-sm text-warning">{t.priority}</div>
              </li>
            ))}
          </ul>
        </Card>
      </main>

      <nav className="fixed bottom-6 left-0 right-0 flex justify-center">
        <div className="bg-card rounded-full p-3 shadow-lg flex space-x-3">
          <button className="p-2 bg-primary text-white rounded-full">📸</button>
          <button className="p-2 bg-primary text-white rounded-full">🎤</button>
          <button className="p-2 bg-primary text-white rounded-full">📄</button>
        </div>
      </nav>
    </div>
  )
}
