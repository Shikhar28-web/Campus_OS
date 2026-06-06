import React from 'react'
import Header from '../components/Header'
import Card from '../components/Card'

export default function FocusEngine() {
  return (
    <div className="min-h-screen safe-area">
      <Header title="AI Focus" />
      <main className="max-w-lg mx-auto px-4 py-4 space-y-4">
        <Card>
          <h3 className="font-medium">Recommended Task</h3>
          <div className="mt-2">
            <div className="text-lg font-semibold">Finish Thermodynamics reading</div>
            <div className="text-sm text-secondary mt-1">Reason: Upcoming assessment + high impact</div>
          </div>
        </Card>

        <Card>
          <h3 className="font-medium">Suggested Schedule</h3>
          <div className="text-sm text-secondary mt-2">45 min focused study • 2x breaks</div>
        </Card>
      </main>
    </div>
  )
}
