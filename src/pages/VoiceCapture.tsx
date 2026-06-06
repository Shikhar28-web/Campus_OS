import React from 'react'
import Header from '../components/Header'
import Card from '../components/Card'

export default function VoiceCapture() {
  return (
    <div className="min-h-screen safe-area">
      <Header title="Voice Capture" />
      <main className="max-w-lg mx-auto px-4 py-4 space-y-4">
        <Card>
          <h3 className="font-medium">Record a Voice Note</h3>
          <div className="mt-4 flex space-x-3">
            <button className="px-4 py-2 bg-primary text-white rounded-lg">Record</button>
            <button className="px-4 py-2 bg-card border rounded-lg">Upload</button>
          </div>
        </Card>
      </main>
    </div>
  )
}
