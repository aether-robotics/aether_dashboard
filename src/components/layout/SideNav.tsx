import { NAV_ITEMS, type NavPage } from './navItems'

interface Props {
  activePage?: NavPage
  onNavigate?: (page: NavPage) => void
}

export function SideNav({ activePage = 'dashboard', onNavigate }: Props) {
  return (
    <aside className="hidden md:flex fixed left-0 top-0 h-screen w-16 flex-col bg-white border-r border-slate-300 z-50">
      {/* Logo */}
      <div className="h-14 flex items-center justify-center border-b border-slate-200">
        <div className="w-8 h-8 bg-primary/5 rounded-lg flex items-center justify-center border border-primary/10">
          <span className="material-symbols-outlined text-primary text-xl">precision_manufacturing</span>
        </div>
      </div>

      {/* Nav Items */}
      <nav className="flex-1 pt-6 flex flex-col gap-2 px-2">
        {NAV_ITEMS.map(({ id, icon, title }) => {
          const isActive = activePage === id
          return (
            <a
              key={id}
              title={title}
              onClick={() => onNavigate?.(id)}
              className={`flex items-center justify-center w-12 h-12 rounded-xl transition-all cursor-pointer ${
                isActive
                  ? 'bg-primary/5 text-primary border border-primary/5'
                  : 'text-slate-400 hover:bg-slate-50 hover:text-slate-900'
              }`}
            >
              <span className="material-symbols-outlined">{icon}</span>
            </a>
          )
        })}
      </nav>

      {/* Footer */}
      <div className="p-2 border-t border-slate-200 flex flex-col items-center gap-4 pb-6">
        <button className="w-10 h-10 text-slate-400 hover:text-slate-900 transition-colors" title="SETTINGS">
          <span className="material-symbols-outlined">settings</span>
        </button>
        <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-primary to-blue-400 border border-white" />
      </div>
    </aside>
  )
}
