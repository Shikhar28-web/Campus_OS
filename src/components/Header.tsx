import React from 'react'

export default function Header({ title }: { title: string }) {
  return (
    <header className="px-4 pt-6 pb-4 bg-bg">
      <div className="max-w-lg mx-auto">
        <div className="flex items-center justify-between">
          <div>
            <div className="text-sm text-secondary">Good afternoon</div>
            <h1 className="text-xl font-semibold text-text">{title}</h1>
          </div>
        </div>
      </div>
    </header>
  )
}
