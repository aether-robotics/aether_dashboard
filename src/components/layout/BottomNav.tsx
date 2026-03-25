import { NAV_ITEMS, type NavPage } from './navItems'

interface Props {
  activePage?: NavPage
  onNavigate?: (page: NavPage) => void
}

export function BottomNav({ activePage = 'dashboard', onNavigate }: Props) {
  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 h-14 bg-white border-t border-slate-300 z-50 flex items-stretch">
      {NAV_ITEMS.map(({ id, icon, title }) => {
        const isActive = activePage === id
        return (
          <button
            key={id}
            onClick={() => onNavigate?.(id)}
            className={`flex-1 flex flex-col items-center justify-center gap-0.5 transition-colors ${
              isActive ? 'text-primary' : 'text-slate-400'
            }`}
          >
            <span className="material-symbols-outlined text-[20px]">{icon}</span>
            <span className="text-[9px] font-bold uppercase tracking-widest">{title}</span>
          </button>
        )
      })}
    </nav>
  )
}
