import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['icons/icon.svg'],
      manifest: {
        name: 'Expert MCQs Web App',
        short_name: 'MCQs',
        description: 'Practice and quiz MCQs with offline support, analytics, and PWA install.',
        theme_color: '#0ea5e9',
        background_color: '#0b1020',
        display: 'standalone',
        start_url: '/',
        icons: [
          { src: 'icons/icon.svg', sizes: '512x512', type: 'image/svg+xml', purpose: 'any maskable' },
        ],
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,svg,png,ico,woff2}'],
        runtimeCaching: [
          {
            urlPattern: ({ url }) => url.origin === ((globalThis as any).location?.origin ?? url.origin),
            handler: 'StaleWhileRevalidate',
          },
        ],
      },
    }),
  ],
})
