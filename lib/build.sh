#!/usr/bin/env bash
# Compile the FK engine to WebAssembly using Emscripten.
# Prerequisites:
#   1. Run ./setup.sh to fetch TinyXML2
#   2. Have emscripten activated: source /path/to/emsdk/emsdk_env.sh
set -euo pipefail

ROOT="$(cd "$(dirname "$0")" && pwd)"
BUILD_DIR="${ROOT}/build_wasm"
OUT_DIR="${ROOT}/../public/wasm"

mkdir -p "$BUILD_DIR" "$OUT_DIR"
cd "$BUILD_DIR"

emcmake cmake "$ROOT" -DCMAKE_BUILD_TYPE=Release
emmake make -j"$(nproc 2>/dev/null || sysctl -n hw.logicalcpu)"

cp fk_engine.js   "$OUT_DIR/"
cp fk_engine.wasm "$OUT_DIR/"

echo "Build complete. Artifacts copied to ${OUT_DIR}/"
