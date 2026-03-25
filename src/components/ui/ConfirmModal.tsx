type PowerAction = 'shutdown' | 'restart'

interface Props {
  action: PowerAction | null
  onConfirm: () => void
  onCancel: () => void
}

const CONFIG: Record<PowerAction, { title: string; description: string; icon: string; confirmLabel: string; iconColor: string }> = {
  shutdown: {
    title: 'Confirm Shutdown',
    description: 'The device will power off immediately. All running services will be stopped.',
    icon: 'power_settings_new',
    confirmLabel: 'Yes, Shutdown',
    iconColor: 'text-red-500',
  },
  restart: {
    title: 'Confirm Restart',
    description: 'The device will reboot. Services will resume after startup.',
    icon: 'restart_alt',
    confirmLabel: 'Yes, Restart',
    iconColor: 'text-amber-500',
  },
}

export function ConfirmModal({ action, onConfirm, onCancel }: Props) {
  if (!action) return null

  const { title, description, icon, confirmLabel, iconColor } = CONFIG[action]

  return (
    <div
      className="fixed inset-0 z-[200] flex items-center justify-center bg-slate-900/30 backdrop-blur-sm"
      onClick={onCancel}
    >
      <div
        className="bg-white rounded-2xl border border-slate-200 shadow-xl w-[380px] p-6 flex flex-col gap-5"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Icon + Title */}
        <div className="flex items-center gap-4">
          <div className={`w-10 h-10 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-center shrink-0 ${iconColor}`}>
            <span className="material-symbols-outlined">{icon}</span>
          </div>
          <div>
            <div className="text-sm font-bold text-slate-900">{title}</div>
            <div className="text-[11px] text-slate-500 mt-0.5">{description}</div>
          </div>
        </div>

        <div className="border-t border-slate-100" />

        {/* Actions */}
        <div className="flex gap-2 justify-end">
          <button
            onClick={onCancel}
            className="px-4 py-2 text-[11px] font-bold uppercase tracking-wider text-slate-600 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors"
          >
            No, Cancel
          </button>
          <button
            onClick={onConfirm}
            className="px-4 py-2 text-[11px] font-bold uppercase tracking-wider text-white bg-slate-900 rounded-lg hover:bg-slate-700 transition-colors"
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  )
}
