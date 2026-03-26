import { useState } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import { Grid, OrbitControls } from '@react-three/drei'
import type { Group } from 'three'
import { useRef } from 'react'
import { WidgetCard } from '../ui/WidgetCard'

interface Props {
  globalFrame?: string
  fixedFrame?: string
}

interface ViewportSettings {
  showGrid: boolean
  cubeScale: number
  lightIntensity: number
  fieldOfView: number
}

interface ViewportSettingsModalProps {
  open: boolean
  settings: ViewportSettings
  onClose: () => void
  onChange: (settings: ViewportSettings) => void
}

function ViewportSettingsModal({ open, settings, onClose, onChange }: ViewportSettingsModalProps) {
  if (!open) return null

  return (
    <div
      className="fixed inset-0 z-[200] flex items-center justify-center bg-slate-900/30 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-2xl border border-slate-200 shadow-xl w-[380px] p-6 flex flex-col gap-5"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center gap-4">
          <div className="w-10 h-10 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-center shrink-0 text-slate-700">
            <span className="material-symbols-outlined">tune</span>
          </div>
          <div>
            <div className="text-sm font-bold text-slate-900">Viewport Settings</div>
            <div className="text-[11px] text-slate-500 mt-0.5">Adjust the simple preview scene and camera defaults.</div>
          </div>
        </div>

        <div className="border-t border-slate-100" />

        <div className="space-y-4">
          <label className="flex items-center justify-between gap-3">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-600">Show Grid</span>
            <button
              type="button"
              onClick={() => onChange({ ...settings, showGrid: !settings.showGrid })}
              className="inline-flex items-center gap-2 text-[10px] font-bold uppercase tracking-wider text-slate-600 transition-colors hover:text-slate-900"
            >
              <span className={`relative h-5 w-9 rounded-full border transition-colors ${settings.showGrid ? 'border-green-600 bg-green-100' : 'border-slate-300 bg-slate-200'}`}>
                <span
                  className={`absolute top-0.5 h-3.5 w-3.5 rounded-full transition-all ${settings.showGrid ? 'left-[18px] bg-green-600' : 'left-0.5 bg-white'}`}
                />
              </span>
            </button>
          </label>

          <label className="block space-y-1.5">
            <div className="flex items-center justify-between gap-3">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-600">Cube Scale</span>
              <span className="text-[11px] font-mono text-slate-500">{settings.cubeScale.toFixed(1)}x</span>
            </div>
            <input
              type="range"
              min="0.6"
              max="2"
              step="0.1"
              value={settings.cubeScale}
              onChange={(e) => onChange({ ...settings, cubeScale: Number(e.target.value) })}
              className="w-full accent-primary"
            />
          </label>

          <label className="block space-y-1.5">
            <div className="flex items-center justify-between gap-3">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-600">Light</span>
              <span className="text-[11px] font-mono text-slate-500">{settings.lightIntensity.toFixed(1)}</span>
            </div>
            <input
              type="range"
              min="0.4"
              max="1.8"
              step="0.1"
              value={settings.lightIntensity}
              onChange={(e) => onChange({ ...settings, lightIntensity: Number(e.target.value) })}
              className="w-full accent-primary"
            />
          </label>

          <label className="block space-y-1.5">
            <div className="flex items-center justify-between gap-3">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-600">Field Of View</span>
              <span className="text-[11px] font-mono text-slate-500">{settings.fieldOfView}°</span>
            </div>
            <input
              type="range"
              min="30"
              max="60"
              step="1"
              value={settings.fieldOfView}
              onChange={(e) => onChange({ ...settings, fieldOfView: Number(e.target.value) })}
              className="w-full accent-primary"
            />
          </label>
        </div>

        <div className="border-t border-slate-100" />

        <div className="flex gap-2 justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 text-[11px] font-bold uppercase tracking-wider text-slate-600 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  )
}

function ViewportScene({
  cameraLocked,
  settings,
}: {
  cameraLocked: boolean
  settings: ViewportSettings
}) {
  const worldRef = useRef<Group>(null)

  useFrame(({ clock }) => {
    const world = worldRef.current
    if (!world) return

    const t = clock.getElapsedTime()
    const robotX = t * 0.55

    world.position.x = 0
    world.position.z = 0
    world.rotation.y = 0
  })

  return (
    <>
      <color attach="background" args={['#f8fafc']} />
      <ambientLight intensity={0.6} />
      <directionalLight position={[6, 8, 5]} intensity={settings.lightIntensity} />

      <group ref={worldRef}>
        {settings.showGrid && (
          <Grid
            position={[0, -0.001, 0]}
            args={[10, 10]}
            cellSize={0.5}
            cellThickness={0.8}
            cellColor="#cbd5e1"
            sectionSize={2}
            sectionThickness={1.2}
            sectionColor="#94a3b8"
            fadeDistance={18}
            fadeStrength={1}
            infiniteGrid
          />
        )}

        <mesh position={[0, 0.02, 0]} rotation={[-Math.PI / 2, 0, 0]}>
          <ringGeometry args={[0.12, 0.14, 32]} />
          <meshBasicMaterial color="#64748b" side={2} />
        </mesh>
      </group>

      <mesh position={[0, 0.5, 0]} scale={settings.cubeScale}>
        <boxGeometry args={[1, 1, 1]} />
        <meshStandardMaterial color="#0f766e" />
      </mesh>

      <OrbitControls
        enableDamping={!cameraLocked}
        enabled={!cameraLocked}
        dampingFactor={0.08}
        enableZoom={!cameraLocked}
        enableRotate={!cameraLocked}
        enablePan={!cameraLocked}
        minDistance={2.5}
        maxDistance={12}
        maxPolarAngle={Math.PI / 2.05}
      />
    </>
  )
}

export function Viewport3D({ globalFrame = '/map', fixedFrame = '/base_link' }: Props) {
  const [cameraLocked, setCameraLocked] = useState(true)
  const [settingsOpen, setSettingsOpen] = useState(false)
  const [settings, setSettings] = useState<ViewportSettings>({
    showGrid: true,
    cubeScale: 1,
    lightIntensity: 1.1,
    fieldOfView: 42,
  })

  return (
    <>
      <WidgetCard className="w-full flex flex-col h-[400px] overflow-hidden">
        <div className="px-4 py-3 flex items-center justify-between border-b border-slate-200 flex-none">
          <span className="text-[11px] font-bold text-slate-900 tracking-widest uppercase">3D Viewport</span>
          <div className="flex items-center gap-1.5">
            <button
              type="button"
              onClick={() => setCameraLocked((locked) => !locked)}
              className="inline-flex items-center gap-2 text-[10px] font-bold uppercase tracking-wider text-slate-600 transition-colors hover:text-slate-900"
              title={cameraLocked ? 'Unlock camera' : 'Lock camera'}
            >
              <span>Camera</span>
              <span className={`relative h-5 w-9 rounded-full border transition-colors ${cameraLocked ? 'border-green-600 bg-green-100' : 'border-slate-300 bg-slate-200'}`}>
                <span
                  className={`absolute top-0.5 h-3.5 w-3.5 rounded-full transition-all ${cameraLocked ? 'left-[18px] bg-green-600' : 'left-0.5 bg-white'}`}
                />
              </span>
            </button>

            <button
              type="button"
              onClick={() => setSettingsOpen(true)}
              title="Viewport settings"
              className="group inline-flex h-7 w-7 items-center justify-center rounded-md text-slate-500 transition-all duration-150 hover:-translate-y-px hover:bg-slate-100 hover:text-slate-900 active:translate-y-0 active:scale-95 active:bg-slate-200/80"
            >
              <span className="material-symbols-outlined text-[16px]">settings</span>
            </button>
          </div>
        </div>

        <div className="relative flex-1 overflow-hidden">
          <Canvas camera={{ position: [4, 4, -4], fov: settings.fieldOfView }}>
            <ViewportScene cameraLocked={cameraLocked} settings={settings} />
          </Canvas>

          <div className="absolute top-3 left-4 z-30 flex flex-col gap-1 pointer-events-none">
            <span className="text-[9px] font-mono font-bold text-slate-500 uppercase bg-white/70 backdrop-blur-sm px-2 py-0.5 rounded border border-slate-200/60 shadow-sm w-fit">
              Global Frame: {globalFrame}
            </span>
            <span className="text-[9px] font-mono font-bold text-slate-500 uppercase bg-white/70 backdrop-blur-sm px-2 py-0.5 rounded border border-slate-200/60 shadow-sm w-fit">
              Fixed Frame: {fixedFrame}
            </span>
          </div>

          {!cameraLocked && (
            <div className="absolute right-4 bottom-3 z-30 pointer-events-none">
              <span className="text-[9px] font-mono font-bold text-slate-500 uppercase bg-white/70 backdrop-blur-sm px-2 py-0.5 rounded border border-slate-200/60 shadow-sm">
                Drag to orbit, scroll to zoom
              </span>
            </div>
          )}
        </div>
      </WidgetCard>

      <ViewportSettingsModal
        open={settingsOpen}
        settings={settings}
        onClose={() => setSettingsOpen(false)}
        onChange={setSettings}
      />
    </>
  )
}
