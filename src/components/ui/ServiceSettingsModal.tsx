import { useState } from 'react'
import type { Service, EnvVar, CommNode, ServiceNode, NodeParam } from '../../types'

// ── Shared param list ──────────────────────────────────────────────────────────

function ParamList({
  params,
  onChange,
}: {
  params: NodeParam[]
  onChange: (updated: NodeParam[]) => void
}) {
  return (
    <div className="space-y-2">
      {params.map((p, i) => (
        <div key={i} className="flex items-center gap-2">
          <input
            value={p.key}
            onChange={(e) => onChange(params.map((x, idx) => idx === i ? { ...x, key: e.target.value } : x))}
            placeholder="param_name"
            className="w-2/5 px-3 py-2 text-xs font-mono text-slate-900 bg-white border border-slate-300 rounded-lg focus:outline-none focus:border-primary"
          />
          <span className="text-slate-400 text-xs">=</span>
          <input
            value={p.value}
            onChange={(e) => onChange(params.map((x, idx) => idx === i ? { ...x, value: e.target.value } : x))}
            placeholder="value"
            className="flex-1 px-3 py-2 text-xs font-mono text-slate-900 bg-white border border-slate-300 rounded-lg focus:outline-none focus:border-primary"
          />
          <button
            onClick={() => onChange(params.filter((_, idx) => idx !== i))}
            className="text-slate-300 hover:text-red-400 transition-colors shrink-0"
          >
            <span className="material-symbols-outlined text-base">remove_circle</span>
          </button>
        </div>
      ))}
      {params.length === 0 && (
        <div className="text-[11px] text-slate-400 italic">No parameters</div>
      )}
      <button
        onClick={() => onChange([...params, { key: '', value: '' }])}
        className="text-[10px] font-bold text-primary uppercase hover:underline flex items-center gap-1 pt-0.5"
      >
        <span className="material-symbols-outlined text-sm">add</span>
        Add
      </button>
    </div>
  )
}

interface Props {
  service: Service | null
  onSave: (updated: Service) => void
  onClose: () => void
}

type Tab = 'config' | 'graph' | 'container'

const RESTART_OPTIONS = ['always', 'on-failure', 'unless-stopped', 'no'] as const

// ── Config Tab ─────────────────────────────────────────────────────────────────

function ConfigTab({
  nodes, onNodesChange, locked,
}: {
  nodes: ServiceNode[]
  onNodesChange: (updated: ServiceNode[]) => void
  locked: boolean
}) {

  if (nodes.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-full gap-2 text-slate-400">
        <span className="material-symbols-outlined text-3xl">account_tree</span>
        <span className="text-[11px] font-medium">No nodes configured</span>
      </div>
    )
  }

  return (
    <div className="p-6 space-y-6">

      {/* Lock toggle */}
      {/* Node list */}
      {nodes.map((node, i) => (
        <div key={node.name} className="space-y-3">
          {i > 0 && <div className="border-t border-slate-100" />}
          <div>
            <div className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">Node</div>
            <div className="text-xs font-bold font-mono text-slate-800">{node.name}</div>
          </div>

          {locked ? (
            /* Read-only view */
            <div className="space-y-1.5">
              {node.params.map((p) => (
                <div key={p.key} className="flex gap-3 items-baseline">
                  <span className="text-[11px] font-mono text-slate-400 w-2/5 shrink-0 truncate">{p.key}</span>
                  <span className="text-[11px] font-mono text-slate-700">{p.value}</span>
                </div>
              ))}
              {node.params.length === 0 && (
                <div className="text-[11px] text-slate-400 italic">No parameters</div>
              )}
            </div>
          ) : (
            /* Editable view */
            <ParamList
              params={node.params}
              onChange={(params) => onNodesChange(nodes.map((n, idx) => idx === i ? { ...n, params } : n))}
            />
          )}
        </div>
      ))}
    </div>
  )
}

// ── Graph Tab ──────────────────────────────────────────────────────────────────

function TopicRow({ name, messageType, rateHz }: { name: string; messageType: string; rateHz?: number }) {
  return (
    <div className="flex items-baseline gap-3 py-0.5">
      <span className="flex-1 text-[11px] font-mono text-slate-800 truncate">{name}</span>
      <span className="text-[10px] font-mono text-slate-400 shrink-0 truncate max-w-[180px]">{messageType}</span>
      {rateHz !== undefined
        ? <span className="text-[10px] font-mono text-slate-400 w-10 text-right shrink-0">{rateHz} Hz</span>
        : <span className="w-10 shrink-0" />
      }
    </div>
  )
}

function CommNodeBlock({ node }: { node: CommNode }) {
  return (
    <div className="space-y-3">
      <div>
        <div className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">Participant</div>
        <div className="text-xs font-bold font-mono text-slate-800">{node.name}</div>
      </div>

      {node.publishers.length > 0 && (
        <div>
          <div className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1.5">Publishers</div>
          {node.publishers.map((t) => <TopicRow key={t.name} {...t} />)}
        </div>
      )}

      {node.subscribers.length > 0 && (
        <div>
          <div className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1.5">Subscribers</div>
          {node.subscribers.map((t) => <TopicRow key={t.name} {...t} />)}
        </div>
      )}

      {node.services && node.services.length > 0 && (
        <div>
          <div className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1.5">Services</div>
          <div className="space-y-0.5">
            {node.services.map((s) => (
              <div key={s} className="text-[11px] font-mono text-slate-700">{s}</div>
            ))}
          </div>
        </div>
      )}

      {node.actions && node.actions.length > 0 && (
        <div>
          <div className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1.5">Actions</div>
          <div className="space-y-0.5">
            {node.actions.map((a) => (
              <div key={a} className="text-[11px] font-mono text-slate-700">{a}</div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

function GraphTab({ service }: { service: Service }) {
  const graph = service.commGraph
  const participants = graph?.nodes ?? []

  if (participants.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-full gap-2 text-slate-400">
        <span className="material-symbols-outlined text-3xl">offline_bolt</span>
        <span className="text-[11px] font-medium">No communication graph available</span>
        <span className="text-[10px] text-slate-300">Service must be running to inspect the graph.</span>
      </div>
    )
  }

  return (
    <div className="p-6 space-y-6">
      {graph?.middleware && (
        <div className="flex items-center gap-2">
          <div className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Middleware</div>
          <div className="text-[10px] font-mono font-bold text-slate-700 px-2 py-0.5 bg-slate-100 rounded border border-slate-200">{graph.middleware}</div>
        </div>
      )}
      {participants.map((node, i) => (
        <div key={node.name}>
          {(i > 0 || graph?.middleware) && <div className="border-t border-slate-100 mb-6" />}
          <CommNodeBlock node={node} />
        </div>
      ))}
    </div>
  )
}

// ── Container Tab ──────────────────────────────────────────────────────────────

function ContainerTab({
  service,
  restartPolicy, setRestartPolicy,
  command, setCommand,
  envVars, setEnvVars,
}: {
  service: Service
  restartPolicy: string
  setRestartPolicy: (v: Service['restartPolicy']) => void
  command: string
  setCommand: (v: string) => void
  envVars: EnvVar[]
  setEnvVars: (fn: (prev: EnvVar[]) => EnvVar[]) => void
}) {
  const memDisplay = service.memoryMB >= 1024
    ? `${(service.memoryMB / 1024).toFixed(1)}GB`
    : `${service.memoryMB}MB`

  return (
    <div className="p-6 space-y-4">
      {/* Runtime stats */}
      <div className="flex items-center gap-6 px-3 py-2.5 bg-slate-50 rounded-xl border border-slate-200">
        <div>
          <div className="text-[9px] font-bold text-slate-400 uppercase tracking-wider mb-0.5">Status</div>
          <div className="text-[11px] font-bold text-slate-700 uppercase">{service.status}</div>
        </div>
        <div>
          <div className="text-[9px] font-bold text-slate-400 uppercase tracking-wider mb-0.5">CPU</div>
          <div className="text-[11px] font-mono text-slate-700">{service.cpuPercent}%</div>
        </div>
        <div>
          <div className="text-[9px] font-bold text-slate-400 uppercase tracking-wider mb-0.5">Memory</div>
          <div className="text-[11px] font-mono text-slate-700">{memDisplay}</div>
        </div>
      </div>

      {/* Read-only: name + image */}
      <div className="space-y-3">
        <div>
          <div className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">Name</div>
          <div className="text-xs font-bold font-mono text-slate-800">{service.name}</div>
        </div>
        <div>
          <div className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">Image</div>
          <div className="text-xs font-mono text-slate-600 break-all">{service.image}</div>
        </div>
      </div>

      {/* Restart Policy */}
      <div>
        <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-1.5">Restart Policy</label>
        <select
          value={restartPolicy}
          onChange={(e) => setRestartPolicy(e.target.value as Service['restartPolicy'])}
          className="w-full px-3 py-2 text-xs font-mono text-slate-900 bg-white border border-slate-300 rounded-lg focus:outline-none focus:border-primary"
        >
          {RESTART_OPTIONS.map((opt) => (
            <option key={opt} value={opt}>{opt}</option>
          ))}
        </select>
      </div>

      {/* Command */}
      <div>
        <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-1.5">Command</label>
        <input
          value={command}
          onChange={(e) => setCommand(e.target.value)}
          placeholder="e.g. ros2 launch my_pkg bringup.launch.py"
          className="w-full px-3 py-2 text-xs font-mono text-slate-900 bg-white border border-slate-300 rounded-lg focus:outline-none focus:border-primary"
        />
      </div>

      {/* Env Vars */}
      <div>
        <div className="flex items-center justify-between mb-1.5">
          <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Environment Variables</label>
          <button
            onClick={() => setEnvVars((prev) => [...prev, { key: '', value: '' }])}
            className="text-[10px] font-bold text-primary uppercase hover:underline flex items-center gap-1"
          >
            <span className="material-symbols-outlined text-sm">add</span>
            Add
          </button>
        </div>
        <div className="space-y-2">
          {envVars.map((env, i) => (
            <div key={i} className="flex items-center gap-2">
              <input
                value={env.key}
                onChange={(e) => setEnvVars((prev) => prev.map((x, idx) => idx === i ? { ...x, key: e.target.value } : x))}
                placeholder="KEY"
                className="w-2/5 px-3 py-2 text-xs font-mono text-slate-900 bg-white border border-slate-300 rounded-lg focus:outline-none focus:border-primary"
              />
              <span className="text-slate-400 text-xs">=</span>
              <input
                value={env.value}
                onChange={(e) => setEnvVars((prev) => prev.map((x, idx) => idx === i ? { ...x, value: e.target.value } : x))}
                placeholder="value"
                className="flex-1 px-3 py-2 text-xs font-mono text-slate-900 bg-white border border-slate-300 rounded-lg focus:outline-none focus:border-primary"
              />
              <button
                onClick={() => setEnvVars((prev) => prev.filter((_, idx) => idx !== i))}
                className="text-slate-300 hover:text-red-400 transition-colors shrink-0"
              >
                <span className="material-symbols-outlined text-base">remove_circle</span>
              </button>
            </div>
          ))}
          {envVars.length === 0 && (
            <div className="text-[11px] text-slate-400 italic">No environment variables</div>
          )}
        </div>
      </div>
    </div>
  )
}

// ── Main component ─────────────────────────────────────────────────────────────

export function ServiceSettingsModal({ service, onSave, onClose }: Props) {
  const [tab, setTab]       = useState<Tab>('config')
  const [locked, setLocked] = useState(true)
  const [nodes, setNodes]   = useState<ServiceNode[]>(service?.nodes ?? [])
  const [restartPolicy, setRestartPolicy]       = useState(service?.restartPolicy ?? 'always')
  const [command, setCommand]                   = useState(service?.command ?? '')
  const [envVars, setEnvVars]                   = useState<EnvVar[]>(service?.envVars ?? [])

  if (!service) return null
  const currentService = service

  function handleSave() {
    onSave({ ...currentService, nodes, restartPolicy: restartPolicy as Service['restartPolicy'], command, envVars })
    onClose()
  }

  const TAB_LABELS: Record<Tab, string> = { config: 'Config', graph: 'Graph', container: 'Container' }

  return (
    <div
      className="fixed inset-0 z-[200] flex items-center justify-center bg-slate-900/30 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-2xl border border-slate-200 shadow-xl w-[560px] h-[660px] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between flex-none">
          <div>
            <div className="text-[11px] font-bold text-slate-900 tracking-widest uppercase">Service Settings</div>
            <div className="text-[10px] text-slate-400 font-mono mt-0.5">{service.id}</div>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-900 transition-colors">
            <span className="material-symbols-outlined text-xl">close</span>
          </button>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-slate-200 px-6 flex-none">
          {(['config', 'graph', 'container'] as Tab[]).map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`px-1 mr-6 py-2.5 text-[10px] font-bold uppercase tracking-widest border-b-2 transition-colors ${
                tab === t
                  ? 'border-primary text-primary'
                  : 'border-transparent text-slate-400 hover:text-slate-700'
              }`}
            >
              {TAB_LABELS[t]}
            </button>
          ))}
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto min-h-0">
          {tab === 'config' && (
            <ConfigTab
              nodes={nodes}
              onNodesChange={setNodes}
              locked={locked}
            />
          )}
          {tab === 'graph' && <GraphTab service={currentService} />}
          {tab === 'container' && (
            <ContainerTab
              service={currentService}
              restartPolicy={restartPolicy}
              setRestartPolicy={setRestartPolicy}
              command={command}
              setCommand={setCommand}
              envVars={envVars}
              setEnvVars={setEnvVars}
            />
          )}
        </div>

        {/* Footer */}
        {tab !== 'graph' && (
          <div className="px-6 py-4 flex items-center justify-between flex-none">
            {/* Lock — Config tab only */}
            <div className="w-8">
              {tab === 'config' && (
                <button
                  onClick={() => setLocked((l) => !l)}
                  title={locked ? 'Unlock to edit' : 'Lock'}
                  className={`transition-colors ${locked ? 'text-slate-400 hover:text-slate-700' : 'text-primary hover:text-primary/70'}`}
                >
                  <span className="material-symbols-outlined text-[10px]">
                    {locked ? 'lock' : 'lock_open'}
                  </span>
                </button>
              )}
            </div>

            {/* Save / Cancel — always on Container tab; Config only when unlocked */}
            {(tab === 'container' || !locked) && (
              <div className="flex gap-2">
                <button
                  onClick={onClose}
                  className="px-4 py-2 text-[11px] font-bold uppercase tracking-wider text-slate-600 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSave}
                  className="px-4 py-2 text-[11px] font-bold uppercase tracking-wider text-white bg-slate-900 rounded-lg hover:bg-slate-700 transition-colors"
                >
                  Save Changes
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
