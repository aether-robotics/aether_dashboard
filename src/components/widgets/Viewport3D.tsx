import { useState, useMemo, useEffect, useRef } from 'react'
import { Canvas, useFrame, useThree } from '@react-three/fiber'
import { Grid, OrbitControls } from '@react-three/drei'
import { ColladaLoader } from 'three/examples/jsm/loaders/ColladaLoader.js'
import { Group, Matrix4 } from 'three'
import { WidgetCard } from '../ui/WidgetCard'
import { useFkEngine } from '../../hooks/useFkEngine'
import type { FkLink, FkLinkTransform } from '../../wasm/fkEngine.types'

/* ── constants ──────────────────────────────────────────────────────────── */

const MODEL_URL = '/models/husky/model.sdf'

const WHEEL_JOINTS = [
  'front_left_wheel_joint',
  'front_right_wheel_joint',
  'rear_left_wheel_joint',
  'rear_right_wheel_joint',
]

/**
 * Gazebo-exported SDFs embed absolute host file paths for mesh URIs.
 * Strip everything up to and including "/public" to get the web-relative path.
 */
function uriToWebUrl(uri: string): string | null {
  const idx = uri.indexOf('/public/')
  if (idx !== -1) return uri.slice(idx + '/public'.length)
  if (uri.startsWith('/') || uri.startsWith('http')) return uri
  return null
}

/* ── types ──────────────────────────────────────────────────────────────── */

interface Props {
  globalFrame?: string
  fixedFrame?:  string
}

interface ViewportSettings {
  showGrid:       boolean
  lightIntensity: number
  fieldOfView:    number
}

/* ── settings modal ─────────────────────────────────────────────────────── */

interface ViewportSettingsModalProps {
  open:     boolean
  settings: ViewportSettings
  onClose:  () => void
  onChange: (s: ViewportSettings) => void
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
            <div className="text-[11px] text-slate-500 mt-0.5">Adjust the 3D scene.</div>
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
                <span className={`absolute top-0.5 h-3.5 w-3.5 rounded-full transition-all ${settings.showGrid ? 'left-[18px] bg-green-600' : 'left-0.5 bg-white'}`} />
              </span>
            </button>
          </label>

          <label className="block space-y-1.5">
            <div className="flex items-center justify-between gap-3">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-600">Light</span>
              <span className="text-[11px] font-mono text-slate-500">{settings.lightIntensity.toFixed(1)}</span>
            </div>
            <input type="range" min="0.4" max="1.8" step="0.1"
              value={settings.lightIntensity}
              onChange={(e) => onChange({ ...settings, lightIntensity: Number(e.target.value) })}
              className="w-full accent-primary" />
          </label>

          <label className="block space-y-1.5">
            <div className="flex items-center justify-between gap-3">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-600">Field Of View</span>
              <span className="text-[11px] font-mono text-slate-500">{settings.fieldOfView}°</span>
            </div>
            <input type="range" min="30" max="60" step="1"
              value={settings.fieldOfView}
              onChange={(e) => onChange({ ...settings, fieldOfView: Number(e.target.value) })}
              className="w-full accent-primary" />
          </label>
        </div>

        <div className="border-t border-slate-100" />
        <div className="flex gap-2 justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 text-[11px] font-bold uppercase tracking-wider text-slate-600 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors"
          >Close</button>
        </div>
      </div>
    </div>
  )
}

/* ── robot meshes (inside Canvas) ───────────────────────────────────────── */

const ROBOT_SPEED_MPS = 0.5   // m/s — world scrolls at this speed in the opposite direction

function RobotMeshes({ links, transforms }: { links: FkLink[]; transforms: FkLinkTransform[] }) {
  const { scene }   = useThree()
  const loader      = useMemo(() => new ColladaLoader(), [])
  const groupsRef   = useRef<Map<number, Group>>(new Map())
  const robotRoot   = useRef<Group | null>(null)

  useEffect(() => {
    if (links.length === 0) return

    // Single parent group — translating this moves the whole robot.
    const root = new Group()
    scene.add(root)
    robotRoot.current = root

    let active = true

    links.forEach((link, li) => {
      // One child Group per link — FK matrix (relative to robot root) applied here.
      const linkGroup = new Group()
      linkGroup.matrixAutoUpdate = false
      root.add(linkGroup)
      groupsRef.current.set(li, linkGroup)

      link.visuals.forEach((vis) => {
        const url = uriToWebUrl(vis.uri)
        if (!url) { console.warn(`[RobotMeshes] cannot resolve URI: ${vis.uri}`); return }

        loader.load(
          url,
          (collada) => {
            if (!active || !collada) return
            collada.scene.applyMatrix4(new Matrix4().fromArray(vis.localMatrix))
            linkGroup.add(collada.scene)
            console.log(`[RobotMeshes] loaded "${link.name}"`)
          },
          undefined,
          (err) => console.error(`[RobotMeshes] failed "${link.name}" ${url}`, err),
        )
      })
    })

    return () => {
      active = false
      scene.remove(root)
      robotRoot.current = null
      groupsRef.current.clear()
    }
  }, [links, scene, loader])

  useFrame(() => {
    // Apply FK transforms — link Groups are children of robotRoot which stays
    // at the scene origin (robot-centric view: world moves, robot stays still).
    transforms.forEach((t, i) => {
      const g = groupsRef.current.get(i)
      if (!g) return
      g.matrix.fromArray(t.matrix)
    })
  })

  return null
}

/* ── scene (inside Canvas) ──────────────────────────────────────────────── */

function ViewportScene({
  cameraLocked,
  settings,
  links,
  transforms,
}: {
  cameraLocked: boolean
  settings:     ViewportSettings
  links:        FkLink[]
  transforms:   FkLinkTransform[]
}) {
  const worldRef = useRef<Group>(null)

  useFrame(({ clock }) => {
    if (worldRef.current) {
      // World scrolls in -X so the stationary robot appears to move forward.
      worldRef.current.position.x = -(clock.getElapsedTime() * ROBOT_SPEED_MPS)
    }
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
      </group>

      {links.length > 0 && <RobotMeshes links={links} transforms={transforms} />}

      <OrbitControls
        enableDamping={!cameraLocked}
        enabled={!cameraLocked}
        dampingFactor={0.08}
        enableZoom={!cameraLocked}
        enableRotate={!cameraLocked}
        enablePan={!cameraLocked}
        minDistance={1.5}
        maxDistance={12}
        maxPolarAngle={Math.PI / 2.05}
      />
    </>
  )
}

/* ── main widget ────────────────────────────────────────────────────────── */

export function Viewport3D({
  globalFrame = '/map',
  fixedFrame  = '/base_link',
}: Props) {
  const [cameraLocked, setCameraLocked] = useState(true)
  const [settingsOpen, setSettingsOpen]  = useState(false)
  const [settings, setSettings]          = useState<ViewportSettings>({
    showGrid:       true,
    lightIntensity: 1.1,
    fieldOfView:    42,
  })

  // Drive all 4 wheels at 1 rad/s until real ROS comms are wired up
  const [jointAngles, setJointAngles] = useState<Map<string, number>>(() => new Map())
  useEffect(() => {
    let angle = 0
    const id = setInterval(() => {
      angle += 1 / 30
      setJointAngles(new Map(WHEEL_JOINTS.map(j => [j, angle])))
    }, 33)
    return () => clearInterval(id)
  }, [])

  const { links, transforms, ready, error } = useFkEngine({
    modelUrl:    MODEL_URL,
    format:      'sdf',
    jointAngles,
  })

  return (
    <>
      <WidgetCard className="w-full flex flex-col h-[400px] overflow-hidden">
        <div className="px-4 py-3 flex items-center justify-between border-b border-slate-200 flex-none">
          <span className="text-[11px] font-bold text-slate-900 tracking-widest uppercase">3D Viewport</span>
          <div className="flex items-center gap-1.5">
            <span className={`text-[9px] font-mono font-bold uppercase px-2 py-0.5 rounded border ${
              error    ? 'bg-red-50 border-red-200 text-red-600'
              : !ready ? 'bg-amber-50 border-amber-200 text-amber-600'
              :          'bg-green-50 border-green-200 text-green-600'
            }`}>
              <span title={error ?? undefined}>
                {error ? 'Error' : !ready ? 'Loading' : 'Ready'}
              </span>
            </span>

            <button
              type="button"
              onClick={() => setCameraLocked((l) => !l)}
              className="inline-flex items-center gap-2 text-[10px] font-bold uppercase tracking-wider text-slate-600 transition-colors hover:text-slate-900"
              title={cameraLocked ? 'Unlock camera' : 'Lock camera'}
            >
              <span>Camera</span>
              <span className={`relative h-5 w-9 rounded-full border transition-colors ${cameraLocked ? 'border-green-600 bg-green-100' : 'border-slate-300 bg-slate-200'}`}>
                <span className={`absolute top-0.5 h-3.5 w-3.5 rounded-full transition-all ${cameraLocked ? 'left-[18px] bg-green-600' : 'left-0.5 bg-white'}`} />
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
          <Canvas camera={{ position: [3, 2.5, -3.5], fov: settings.fieldOfView }}>
            <ViewportScene
              cameraLocked={cameraLocked}
              settings={settings}
              links={links}
              transforms={transforms}
            />
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
                Drag to orbit · scroll to zoom
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
