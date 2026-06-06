interface CardProps {
  children: React.ReactNode
  className?: string
  onClick?: () => void
  gradient?: boolean
}

export default function Card({ children, className = '', onClick, gradient }: CardProps) {
  const base = `rounded-2xl border border-slate-100 dark:border-gray-800 shadow-card
    bg-white dark:bg-gray-900 overflow-hidden`
  const gradientCls = gradient
    ? 'bg-gradient-to-br from-primary-500 to-primary-700 border-0 text-white'
    : ''
  const clickCls = onClick
    ? 'cursor-pointer active:scale-[0.98] hover:shadow-card-lg transition-all duration-150'
    : ''

  return (
    <div
      className={`${base} ${gradientCls} ${clickCls} ${className}`}
      onClick={onClick}
      role={onClick ? 'button' : undefined}
    >
      {children}
    </div>
  )
}
