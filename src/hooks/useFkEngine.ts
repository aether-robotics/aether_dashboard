import { useState, useEffect, useRef } from 'react'
import { loadFkEngine, printFkTree } from '../wasm/fkEngine'
import type { FkEngineInstance, FkLink, FkLinkTransform, ModelFormat } from '../wasm/fkEngine.types'

interface UseFkEngineOptions {
  modelUrl: string | undefined
  format: ModelFormat
  jointAngles: Map<string, number>
}

interface UseFkEngineResult {
  links: FkLink[]
  transforms: FkLinkTransform[]
  ready: boolean
  error: string | null
}

export function useFkEngine({ modelUrl, format, jointAngles }: UseFkEngineOptions): UseFkEngineResult {
  const [ready, setReady]           = useState(false)
  const [error, setError]           = useState<string | null>(null)
  const [links, setLinks]           = useState<FkLink[]>([])
  const [transforms, setTransforms] = useState<FkLinkTransform[]>([])
  const engineRef                   = useRef<FkEngineInstance | null>(null)

  /* load model once when modelUrl / format changes */
  useEffect(() => {
    if (!modelUrl) return

    let cancelled = false
    setReady(false)
    setError(null)

    async function load() {
      try {
        const xml = await fetch(modelUrl!).then((r) => {
          if (!r.ok) throw new Error(`Failed to fetch model: ${r.status}`)
          return r.text()
        })
        const engine = await loadFkEngine(xml, format)
        if (cancelled) { engine.destroy(); return }
        engineRef.current = engine
        setLinks(engine.links)
        printFkTree(engine)
        setReady(true)
      } catch (e) {
        if (!cancelled) setError(String(e))
      }
    }

    load()

    return () => {
      cancelled = true
      engineRef.current?.destroy()
      engineRef.current = null
      setReady(false)
      setLinks([])
      setTransforms([])
    }
  }, [modelUrl, format])

  /* recompute FK whenever joint angles change */
  useEffect(() => {
    if (!ready || !engineRef.current) return
    setTransforms(engineRef.current.computeFk(jointAngles))
  }, [ready, jointAngles])

  return { links, transforms, ready, error }
}
