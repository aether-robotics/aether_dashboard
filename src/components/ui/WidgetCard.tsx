import type { ReactNode } from 'react'

interface Props {
  children: ReactNode
  className?: string
}

export function WidgetCard({ children, className = '' }: Props) {
  return (
    <div className={`widget-card ${className}`}>
      {children}
    </div>
  )
}
