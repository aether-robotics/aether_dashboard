import { WidgetCard } from '../ui/WidgetCard'

interface Props {
  globalFrame?: string
  fixedFrame?: string
}

export function Viewport3D({ globalFrame = '/map', fixedFrame = '/base_link' }: Props) {
  return (
    <WidgetCard className="w-full flex flex-col h-[400px] overflow-hidden">
      <div className="px-4 py-3 flex items-center justify-between border-b border-slate-200 flex-none">
        <span className="text-[11px] font-bold text-slate-900 tracking-widest uppercase">3D Viewport</span>
      </div>

      {/* Viewport */}
      <div className="relative flex-1 overflow-hidden">
        {/* Perspective grid */}
        <div className="rviz-grid" />

        {/* Point cloud overlay */}
        <div className="point-cloud-container">
          <div className="lidar-point cluster" style={{ top: '35%', left: '40%' }} />
          <div className="lidar-point cluster" style={{ top: '34%', left: '41%' }} />
          <div className="lidar-point cluster" style={{ top: '36%', left: '42%' }} />
          <div className="lidar-point cluster" style={{ top: '33%', left: '43%' }} />
          <div className="lidar-point"         style={{ top: '38%', left: '45%' }} />
          <div className="lidar-point cluster" style={{ top: '45%', left: '60%' }} />
          <div className="lidar-point cluster" style={{ top: '46%', left: '62%' }} />
          <div className="lidar-point cluster" style={{ top: '44%', left: '63%' }} />
          <div className="lidar-point"         style={{ top: '50%', left: '55%' }} />
          <div className="lidar-point"         style={{ top: '52%', left: '35%' }} />
          <div className="lidar-point cluster" style={{ top: '55%', left: '38%' }} />
          <div className="lidar-point cluster" style={{ top: '54%', left: '36%' }} />
          <div className="lidar-point"         style={{ top: '42%', left: '52%' }} />
          <div className="lidar-point"         style={{ top: '30%', left: '50%' }} />
          <div className="lidar-point cluster" style={{ top: '40%', left: '30%' }} />
          {/* Origin crosshair */}
          <div className="absolute" style={{ top: '50%', left: '50%', width: 30, height: 1, background: '#cbd5e1', transform: 'translate(-50%,-50%)' }} />
          <div className="absolute" style={{ top: '50%', left: '50%', width: 1, height: 30, background: '#cbd5e1', transform: 'translate(-50%,-50%)' }} />
        </div>

        {/* Frame overlays */}
        <div className="absolute top-3 left-4 z-30 flex flex-col gap-1 pointer-events-none">
          <span className="text-[9px] font-mono font-bold text-slate-500 uppercase bg-white/60 backdrop-blur-sm px-2 py-0.5 rounded border border-slate-200/50 shadow-sm w-fit">
            Global Frame: {globalFrame}
          </span>
          <span className="text-[9px] font-mono font-bold text-slate-500 uppercase bg-white/60 backdrop-blur-sm px-2 py-0.5 rounded border border-slate-200/50 shadow-sm w-fit">
            Fixed Frame: {fixedFrame}
          </span>
        </div>
      </div>
    </WidgetCard>
  )
}
