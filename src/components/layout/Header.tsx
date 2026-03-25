import { useEffect, useRef, useState } from 'react'
import { ConfirmModal } from '../ui/ConfirmModal'

type PowerAction = 'shutdown' | 'restart'

interface Props {
  nodeName: string
  release: string
  uptime: string
  heartbeat: boolean
  online: boolean
  onShutdown?: () => void
  onRestart?: () => void
}

export function Header({ nodeName, release, uptime, heartbeat, online, onShutdown, onRestart }: Props) {
  const [powerMenuOpen, setPowerMenuOpen] = useState(false)
  const [pendingAction, setPendingAction] = useState<PowerAction | null>(null)
  const powerRef = useRef<HTMLDivElement>(null)

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (powerRef.current && !powerRef.current.contains(e.target as Node)) {
        setPowerMenuOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  function handleSelect(action: PowerAction) {
    setPowerMenuOpen(false)
    setPendingAction(action)
  }

  function handleConfirm() {
    if (pendingAction === 'shutdown') onShutdown?.()
    if (pendingAction === 'restart') onRestart?.()
    setPendingAction(null)
  }

  return (
    <>
      <header className="col-span-full h-16 px-6 flex items-center justify-between bg-white border-b border-slate-300 z-40">
        <div className="flex items-center gap-6">
          {/* Breadcrumb + Title */}
          <div>
            <div className="flex items-center gap-2 mb-0.5">
              <span className="text-[10px] font-bold text-primary tracking-widest uppercase">Industrial Automation</span>
              <span className="material-symbols-outlined text-[10px] text-slate-400">chevron_right</span>
              <span className="text-[10px] font-bold text-slate-400 tracking-widest uppercase">NODE_B_01</span>
            </div>
            <div className="flex items-center gap-3">
              <h1 className="text-xl font-headline font-bold text-slate-900 tracking-tight">{nodeName}</h1>
              {online && (
                <span className="px-2 py-0.5 bg-green-50 text-green-600 text-[10px] font-bold rounded border border-green-200 flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse" />
                  ONLINE
                </span>
              )}
            </div>
          </div>

          <div className="h-8 w-px bg-slate-200 hidden lg:block" />

          {/* System Info */}
          <div className="hidden lg:flex items-center gap-6">
            <div>
              <div className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter">Release</div>
              <div className="text-xs font-mono font-bold text-slate-700 uppercase">{release}</div>
            </div>
            <div>
              <div className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter">Uptime</div>
              <div className="text-xs font-bold text-slate-700 uppercase">{uptime}</div>
            </div>
            <div>
              <div className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter">Heartbeat</div>
              <div className="flex items-center gap-1.5">
                <div className="text-xs font-bold text-slate-700 uppercase">{heartbeat ? 'Active' : 'Lost'}</div>
                <span className={`w-1.5 h-1.5 rounded-full ${heartbeat ? 'bg-green-500' : 'bg-red-500'}`} />
              </div>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-3">
          <div className="flex gap-2">
            <button className="px-3 py-2 bg-primary text-white rounded-lg text-[10px] font-bold uppercase hover:bg-primary/90 transition-all flex items-center gap-2">
              <span className="material-symbols-outlined text-sm">system_update_alt</span>
              <span className="hidden md:inline">Update Manager</span>
            </button>

            {/* Power button + dropdown */}
            <div ref={powerRef} className="relative">
              <button
                onClick={() => setPowerMenuOpen((o) => !o)}
                className="px-3 py-2 bg-white text-slate-900 border border-slate-300 rounded-lg text-[10px] font-bold uppercase hover:bg-slate-50 transition-all flex items-center gap-2"
              >
                <span className="material-symbols-outlined text-sm">power_settings_new</span>
                <span className="hidden md:inline">Power</span>
                <span className="material-symbols-outlined text-sm hidden md:inline">
                  {powerMenuOpen ? 'expand_less' : 'expand_more'}
                </span>
              </button>

              {powerMenuOpen && (
                <div className="absolute right-0 top-full mt-1.5 w-44 bg-white border border-slate-200 rounded-xl shadow-lg z-50 overflow-hidden py-1">
                  <button
                    onClick={() => handleSelect('restart')}
                    className="w-full flex items-center gap-3 px-4 py-2.5 text-[11px] font-bold text-slate-700 uppercase tracking-wider hover:bg-slate-50 transition-colors"
                  >
                    <span className="material-symbols-outlined text-sm text-amber-500">restart_alt</span>
                    Restart
                  </button>
                  <button
                    onClick={() => handleSelect('shutdown')}
                    className="w-full flex items-center gap-3 px-4 py-2.5 text-[11px] font-bold text-slate-700 uppercase tracking-wider hover:bg-slate-50 transition-colors"
                  >
                    <span className="material-symbols-outlined text-sm text-red-500">power_settings_new</span>
                    Shutdown
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </header>

      <ConfirmModal
        action={pendingAction}
        onConfirm={handleConfirm}
        onCancel={() => setPendingAction(null)}
      />
    </>
  )
}
