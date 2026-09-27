import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

// 🔥 Rewrites the auto-injected <link rel="stylesheet"> to load
// non-blocking, same "print swap" trick already used for Google Fonts.
// Vite generates the CSS <link> tag itself at build time (hashed filename),
// so this has to happen via transformIndexHtml, not by editing index.html directly.
function nonBlockingCss() {
  return {
    name: 'non-blocking-css',
    transformIndexHtml(html) {
      return html.replace(
        /<link rel="stylesheet" crossorigin href="([^"]+)">/,
        (match, href) =>
          `<link rel="preload" as="style" href="${href}" />` +
          `<link rel="stylesheet" href="${href}" media="print" onload="this.media='all'" />` +
          `<noscript><link rel="stylesheet" href="${href}" /></noscript>`
      )
    }
  }
}

export default defineConfig({
  plugins: [react(), nonBlockingCss()],
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