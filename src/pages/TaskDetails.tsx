import React from 'react'
import Header from '../components/Header'
import Card from '../components/Card'
import { tasks } from '../data/mock'

export default function TaskDetails({ id }: { id?: string }) {
  const task = tasks[0]
  return (
    <div className="min-h-screen safe-area">
      <Header title="Task Details" />
      <main className="max-w-lg mx-auto px-4 py-4 space-y-4">
        <Card>
          <div className="font-semibold text-lg">{task.title}</div>
          <div className="text-sm text-secondary mt-1">{task.subject} • Deadline {task.deadline}</div>
        </Card>

        <Card>
          <h4 className="font-medium">Source</h4>
          <div className="text-sm text-secondary mt-2">{task.source}</div>
        </Card>
      </main>
    </div>
  )
}
