import type { ReactNode } from 'react'

interface Props {
  header: ReactNode
  leftPanel: ReactNode
  centerPanel: ReactNode
  rightPanel: ReactNode
}

export function DashboardLayout({ header, leftPanel, centerPanel, rightPanel }: Props) {
  return (
    <div className="md:ml-16 grid grid-cols-1 md:[grid-template-columns:2fr_3fr] lg:[grid-template-columns:2fr_3fr_3fr] [grid-template-rows:auto_1fr] min-h-screen md:h-screen pb-14 md:pb-0">
      {header}
      <aside className="p-[0.84rem] flex flex-col gap-[0.84rem] md:overflow-y-auto border-r border-slate-200 order-3 md:order-none">
        {leftPanel}
      </aside>
      <main className="relative central-stage flex flex-col items-center md:h-full border-r border-slate-200 md:overflow-y-auto p-[0.84rem] order-1 md:order-none">
        {centerPanel}
      </main>
      <aside className="p-[0.84rem] flex flex-col gap-[0.84rem] md:overflow-y-auto md:col-span-2 lg:col-span-1 order-2 md:order-none">
        {rightPanel}
      </aside>
    </div>
  )
}
