import React from 'react'

export default function Card({ children }: { children: React.ReactNode }) {
  return (
    <div className="bg-card rounded-xl p-4 shadow-sm border border-gray-100">{children}</div>
  )
}
