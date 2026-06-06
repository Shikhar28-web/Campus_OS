import React from 'react'
import Header from '../components/Header'
import Card from '../components/Card'

export default function LifeInbox() {
  const items = [
    { id: 'i1', kind: 'Screenshot', status: 'New', extracted: 'Task found: Submit form' },
    { id: 'i2', kind: 'PDF', status: 'Processed', extracted: 'Exam Notice: 12 June' }
  ]

  return (
    <div className="min-h-screen safe-area">
      <Header title="Life Inbox" />
      <main className="max-w-lg mx-auto px-4 py-4 space-y-4">
        {items.map(it => (
          <Card key={it.id}>
            <div className="flex justify-between items-start">
              <div>
                <div className="text-sm text-secondary">{it.kind}</div>
                <div className="font-medium">{it.extracted}</div>
              </div>
              <div className="text-xs text-secondary">{it.status}</div>
            </div>
          </Card>
        ))}
      </main>
    </div>
  )
}
