import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

export default defineConfig({
  plugins: [react()],
  build: {
    rollupOptions: {
      output: {
        manualChunks: (id) => {
          if (id.includes('node_modules')) {
            // 🔥 Safely extracts React engine to speed up JS evaluation time
            if (id.includes('react') || id.includes('react-dom') || id.includes('react-router')) {
              return 'react-core'
            }
            // We intentionally DO NOT return a catch-all 'vendor' here. 
            // We let Vite naturally split the rest to prevent network traffic jams!
          }
        }
      }
    }
  }
})