import React from 'react'
import Header from '../components/Header'
import Card from '../components/Card'

export default function AcademicPulse() {
  return (
    <div className="min-h-screen safe-area">
      <Header title="Academic Pulse" />
      <main className="max-w-lg mx-auto px-4 py-4 space-y-4">
        <Card>
          <div className="flex items-center justify-between">
            <div>
              <div className="text-sm text-secondary">Pulse Score</div>
              <div className="text-2xl font-semibold">78</div>
            </div>
            <div className="text-sm text-secondary">Workload: Moderate</div>
          </div>
        </Card>

        <Card>
          <h3 className="font-medium">Assignment Status</h3>
          <div className="text-sm text-secondary mt-2">2 overdue • 4 due soon</div>
        </Card>
      </main>
    </div>
  )
}
