interface Props {
  nodeName: string
  release: string
  uptime: string
  heartbeat: boolean
  online: boolean
}

export function Header({ nodeName, release, uptime, heartbeat, online }: Props) {
  return (
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
          <button className="px-3 py-2 bg-white text-slate-900 border border-slate-300 rounded-lg text-[10px] font-bold uppercase hover:bg-slate-50 transition-all flex items-center gap-2">
            <span className="material-symbols-outlined text-sm">power_settings_new</span>
            <span className="hidden md:inline">Power</span>
          </button>
        </div>
      </div>
    </header>
  )
}
