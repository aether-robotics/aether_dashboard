/**
 * TypeScript wrapper around the fk_engine WASM module.
 *
 * Coordinate system note
 * ──────────────────────
 * The FK matrices are in ROS Z-up frame (X forward, Y left, Z up).
 * Call rosMatToThreejsMat() before passing to Three.js objects.
 * ColladaLoader files exported with Z_UP are already rotated by Rx(-90°)
 * internally, so this conversion must be applied at the link-group level,
 * not at the mesh level.
 */

import type { FkEngineInstance, FkJoint, FkLink, FkLinkTransform, ModelFormat } from './fkEngine.types'

/* ── Emscripten module type (minimal surface we use) ────────────────────── */

interface EmModule {
  ccall(name: string, returnType: string, argTypes: string[], args: unknown[]): unknown
  _malloc(size: number): number
  _free(ptr: number): void
  /* Available after rebuild with HEAPU8/HEAPF32 in EXPORTED_RUNTIME_METHODS.
   * wasmMemory is always present internally as a fallback. */
  HEAPU8?: Uint8Array
  HEAPF32?: Float32Array
  wasmMemory?: WebAssembly.Memory
  UTF8ToString(ptr: number): string
  stringToUTF8(str: string, outPtr: number, maxBytesToWrite: number): void
  lengthBytesUTF8(str: string): number
}

/** Get the WASM linear memory buffer — tries exported views first, then wasmMemory. */
function getWasmBuffer(em: EmModule): ArrayBufferLike {
  const buf = em.HEAPU8?.buffer ?? em.HEAPF32?.buffer ?? em.wasmMemory?.buffer
  if (!buf) throw new Error('Cannot access WASM memory. Rebuild lib/ with HEAPU8,HEAPF32 in EXPORTED_RUNTIME_METHODS.')
  return buf
}

/* ── singleton module loader ─────────────────────────────────────────────── */

/*
 * Vite 5+ blocks import() of JS files inside public/.
 * Workaround: fetch the Emscripten glue as text, wrap it in a blob URL,
 * then import the blob URL (Vite never sees it).
 * Pass locateFile so Emscripten can find the .wasm alongside the glue.
 */
let _modulePromise: Promise<EmModule> | null = null

function getModule(): Promise<EmModule> {
  if (!_modulePromise) {
    _modulePromise = (async () => {
      const jsRes   = await fetch('/wasm/fk_engine.js')
      if (!jsRes.ok) throw new Error(`WASM glue not found: /wasm/fk_engine.js (${jsRes.status}). Run lib/build.sh first.`)
      const jsText  = await jsRes.text()
      const blobUrl = URL.createObjectURL(new Blob([jsText], { type: 'text/javascript' }))
      try {
        const mod = await import(/* @vite-ignore */ blobUrl) as { default: (opts: object) => Promise<EmModule> }
        return mod.default({
          locateFile: (filename: string) => `/wasm/${filename}`,
        })
      } finally {
        URL.revokeObjectURL(blobUrl)
      }
    })()
  }
  return _modulePromise
}

/* ── coordinate conversion ───────────────────────────────────────────────── */

/**
 * Convert a column-major 4x4 matrix from ROS Z-up frame to Three.js Y-up frame.
 *
 * Derivation: T_threejs = Rx(-90°) * T_ros * Rx(90°)
 *
 *   out[0]  = m[0]    out[4]  = m[8]    out[8]  = -m[4]   out[12] = m[12]
 *   out[1]  = m[2]    out[5]  = m[10]   out[9]  = -m[6]   out[13] = m[14]
 *   out[2]  = -m[1]   out[6]  = -m[9]   out[10] = m[5]    out[14] = -m[13]
 *   out[3]  = 0       out[7]  = 0       out[11] = 0       out[15] = 1
 */
export function rosMatToThreejsMat(m: Float32Array, out: Float32Array): void {
  out[0]  =  m[0];  out[1]  =  m[2];  out[2]  = -m[1];  out[3]  = 0
  out[4]  =  m[8];  out[5]  =  m[10]; out[6]  = -m[9];  out[7]  = 0
  out[8]  = -m[4];  out[9]  = -m[6];  out[10] =  m[5];  out[11] = 0
  out[12] =  m[12]; out[13] =  m[14]; out[14] = -m[13]; out[15] = 1
}

/* ── helpers ─────────────────────────────────────────────────────────────── */

function allocString(em: EmModule, str: string): number {
  const bytes = em.lengthBytesUTF8(str) + 1
  const ptr   = em._malloc(bytes)
  em.stringToUTF8(str, ptr, bytes)
  return ptr
}

function readPtr32(em: EmModule, arrayPtr: number, index: number): number {
  return new DataView(getWasmBuffer(em)).getUint32(arrayPtr + index * 4, true)
}

/* ── main loader ─────────────────────────────────────────────────────────── */

export async function loadFkEngine(
  xmlText: string,
  format: ModelFormat,
): Promise<FkEngineInstance> {
  const em = await getModule()

  /* load model */
  const xmlPtr = allocString(em, xmlText)
  const handle = em.ccall(
    'fk_load_model', 'number', ['number', 'number'],
    [xmlPtr, format === 'sdf' ? 0 : 1],
  ) as number
  em._free(xmlPtr)

  if (handle === 0) throw new Error('fk_load_model failed — check XML syntax')

  /* read link count */
  const linkCount = em.ccall('fk_link_count', 'number', ['number'], [handle]) as number

  /* read link names */
  const namePtrArrayPtr = em._malloc(linkCount * 4)
  em.ccall('fk_get_link_names', 'void', ['number', 'number'], [handle, namePtrArrayPtr])
  const linkNames: string[] = []
  for (let i = 0; i < linkCount; i++) {
    linkNames.push(em.UTF8ToString(readPtr32(em, namePtrArrayPtr, i)))
  }
  em._free(namePtrArrayPtr)

  /* read visual info per link */
  const links: FkLink[] = linkNames.map((name, li) => {
    const vCount = em.ccall('fk_visual_count', 'number', ['number', 'number'], [handle, li]) as number
    const visuals = []
    const matPtr  = em._malloc(16 * 4)
    for (let vi = 0; vi < vCount; vi++) {
      const uriPtr = em.ccall(
        'fk_visual_uri', 'number', ['number', 'number', 'number'], [handle, li, vi],
      ) as number
      em.ccall('fk_visual_local_matrix', 'void',
        ['number', 'number', 'number', 'number'], [handle, li, vi, matPtr])

      const rosMat      = new Float32Array(getWasmBuffer(em), matPtr, 16)
      const localMatrix = new Float32Array(16)
      rosMatToThreejsMat(rosMat, localMatrix)

      visuals.push({ uri: em.UTF8ToString(uriPtr), localMatrix })
    }
    em._free(matPtr)
    return { name, visuals }
  })

  /* read root link */
  const rootLink = em.UTF8ToString(
    em.ccall('fk_root_link', 'number', ['number'], [handle]) as number
  )

  /* read joints */
  const jointCount = em.ccall('fk_joint_count', 'number', ['number'], [handle]) as number
  const tmpVec     = em._malloc(16 * 4)
  const joints: FkJoint[] = []
  for (let ji = 0; ji < jointCount; ji++) {
    const namePtr   = em.ccall('fk_joint_name',        'number', ['number', 'number'], [handle, ji]) as number
    const typePtr   = em.ccall('fk_joint_type',        'number', ['number', 'number'], [handle, ji]) as number
    const parentPtr = em.ccall('fk_joint_parent_link', 'number', ['number', 'number'], [handle, ji]) as number
    const childPtr  = em.ccall('fk_joint_child_link',  'number', ['number', 'number'], [handle, ji]) as number

    em.ccall('fk_joint_axis', 'void', ['number', 'number', 'number'], [handle, ji, tmpVec])
    const axisArr = new Float32Array(getWasmBuffer(em), tmpVec, 3)
    const axis: [number, number, number] = [axisArr[0], axisArr[1], axisArr[2]]

    em.ccall('fk_joint_transform', 'void', ['number', 'number', 'number'], [handle, ji, tmpVec])
    const transform = new Float32Array(16)
    transform.set(new Float32Array(getWasmBuffer(em), tmpVec, 16))

    joints.push({
      name:       em.UTF8ToString(namePtr),
      type:       em.UTF8ToString(typePtr),
      parentLink: em.UTF8ToString(parentPtr),
      childLink:  em.UTF8ToString(childPtr),
      axis,
      transform,
    })
  }
  em._free(tmpVec)

  /* pre-allocate FK output buffer (reused every computeFk call) */
  const matrixBufPtr = em._malloc(linkCount * 16 * 4)

  return {
    links,
    joints,
    rootLink,

    computeFk(jointAngles: Map<string, number>): FkLinkTransform[] {
      const entries = [...jointAngles.entries()]
      const jCount  = entries.length

      /* write joint names and angles onto the WASM heap */
      const namePtrs      = entries.map(([n]) => allocString(em, n))
      const jNameArrayPtr = em._malloc(jCount * 4)
      const jAngleArrayPtr = em._malloc(jCount * 4)

      const buf        = getWasmBuffer(em)
      const angleView  = new Float32Array(buf, jAngleArrayPtr, jCount)
      const namesDv    = new DataView(buf)
      entries.forEach(([, angle], i) => { angleView[i] = angle })
      namePtrs.forEach((p, i) => { namesDv.setUint32(jNameArrayPtr + i * 4, p, true) })

      em.ccall('fk_compute', 'void',
        ['number', 'number', 'number', 'number', 'number'],
        [handle, jNameArrayPtr, jAngleArrayPtr, jCount, matrixBufPtr])

      namePtrs.forEach((p) => em._free(p))
      em._free(jNameArrayPtr)
      em._free(jAngleArrayPtr)

      /* convert each link matrix ROS→Three.js — recreate view after ccall in case of heap growth */
      return linkNames.map((name, i) => {
        const rosMat = new Float32Array(getWasmBuffer(em), matrixBufPtr + i * 16 * 4, 16)
        const matrix = new Float32Array(16)
        rosMatToThreejsMat(rosMat, matrix)
        return { name, matrix }
      })
    },

    destroy() {
      em.ccall('fk_destroy', 'void', ['number'], [handle])
      em._free(matrixBufPtr)
    },
  }
}

/* ── FK tree printer ─────────────────────────────────────────────────────── */

export function printFkTree(engine: FkEngineInstance): void {
  const { joints, rootLink } = engine

  /* build parent → children map */
  const childrenOf = new Map<string, FkJoint[]>()
  for (const j of joints) {
    const arr = childrenOf.get(j.parentLink) ?? []
    arr.push(j)
    childrenOf.set(j.parentLink, arr)
  }

  const RAD2DEG = 180 / Math.PI

  function fmtXYZ(m: Float32Array): string {
    /* translation is column 3 of a column-major 4×4 matrix: indices 12,13,14 */
    return `xyz (${m[12].toFixed(4)}, ${m[13].toFixed(4)}, ${m[14].toFixed(4)})`
  }

  function fmtAxis(ax: [number, number, number]): string {
    return `[${ax.map(v => v.toFixed(0)).join(', ')}]`
  }

  function fmtRPY(m: Float32Array): string {
    /* extract ZYX Euler from rotation part of column-major matrix
       R = | m0 m4 m8  |
           | m1 m5 m9  |
           | m2 m6 m10 |  */
    const sy = Math.sqrt(m[0] * m[0] + m[1] * m[1])
    const roll  = sy > 1e-6 ? Math.atan2( m[6],  m[10]) : Math.atan2(-m[9],  m[5])
    const pitch = Math.atan2(-m[2], sy)
    const yaw   = sy > 1e-6 ? Math.atan2( m[1],  m[0])  : 0
    return `rpy (${(roll*RAD2DEG).toFixed(2)}°, ${(pitch*RAD2DEG).toFixed(2)}°, ${(yaw*RAD2DEG).toFixed(2)}°)`
  }

  function printLink(link: string, prefix: string, isLast: boolean): void {
    const branch = prefix === '' ? '' : (isLast ? '└─ ' : '├─ ')
    console.log(`%c${prefix}${branch}${link}`, 'font-weight:bold')

    const children  = childrenOf.get(link) ?? []
    const childPfx  = prefix === '' ? '' : prefix + (isLast ? '   ' : '│  ')

    children.forEach((j, i) => {
      const last    = i === children.length - 1
      const jPfx    = childPfx + (last ? '└─ ' : '├─ ')
      const axStr   = j.type !== 'fixed' ? `  axis ${fmtAxis(j.axis)}` : ''
      console.log(`${jPfx}[${j.type}]${axStr}  ${j.name}`)
      const tPfx    = childPfx + (last ? '   ' : '│  ') + '   '
      console.log(`${tPfx}${fmtXYZ(j.transform)}   ${fmtRPY(j.transform)}`)
      printLink(j.childLink, childPfx + (last ? '   ' : '│  '), true)
    })
  }

  const linkCount  = engine.links.length
  const jointCount = engine.joints.length
  console.groupCollapsed(`[FK Tree] root="${rootLink}"  ${linkCount} links  ${jointCount} joints`)
  printLink(rootLink, '', true)
  console.groupEnd()
}
