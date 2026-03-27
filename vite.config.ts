import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [tailwindcss(), react()],
  /*
   * Tell Vite to treat .wasm files as static assets so the Emscripten glue
   * can locate fk_engine.wasm via its hard-coded relative URL at runtime.
   * Both fk_engine.js and fk_engine.wasm must be in public/wasm/.
   */
  assetsInclude: ['**/*.wasm'],
  optimizeDeps: {
    /* Exclude the Emscripten glue from pre-bundling — it is fetched at runtime */
    exclude: ['fk_engine'],
  },
})
