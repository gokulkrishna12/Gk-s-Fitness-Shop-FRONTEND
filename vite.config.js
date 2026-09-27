import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

export default defineConfig({
  plugins: [react()],
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          // 🔥 Safely isolates the React engine, speeding up JS evaluation time in Lighthouse
          vendor: ['react', 'react-dom', 'react-router-dom'],
        }
      }
    }
  }
})