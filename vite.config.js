import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { VitePWA } from "vite-plugin-pwa";


export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
    VitePWA({
      registerType: 'autoUpdate',
      srcDir: 'public', // optional if your sw.js is in /public
      filename: 'sw.js', // tells Vite to use /public/sw.js
      strategies: 'injectManifest', // since i am writing the sw manually
      injectManifest: {
        swSrc: 'public/sw.js',
        swDest: 'dist/sw.js',
      },
      includeAssets: [
        'favicon.ico',
        'apple-touch-icon.png',
        'maskable-icon.png',
      ],
      manifest: {
        name: 'theswiftline',
        short_name: 'theswiftline',
        description:
          'A queue management system that allows users to create and manage events, view their queue status',
        icons: [
          {
            src: '/android-chrome-192x192.png',
            sizes: '192x192',
            type: 'image/png',
            purpose: 'any',
          },
          {
            src: '/android-chrome-512x512.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'any',
          },
          {
            src: '/apple-touch-icon.png',
            sizes: '180x180',
            type: 'image/png',
            purpose: 'any',
          },
          {
            src: '/maskable-icon.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'any maskable',
          },
        ],
        theme_color: '#698474',
        background_color: '#698474',
        display: 'standalone',
        scope: '/',
        start_url: '/',
        orientation: 'portrait',
      },
      devOptions: {
        enabled: true,
        type: 'module',
        navigateFallback: 'index.html'
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,ico,png,svg}'],
        navigateFallback: '/index.html',
        runtimeCaching: [
          {
            urlPattern: /^https:\/\/fonts\.googleapis\.com\/.*/i,
            handler: 'CacheFirst',
            options: {
              cacheName: 'google-fonts-cache',
              expiration: {
                maxEntries: 10,
                maxAgeSeconds: 60 * 60 * 24 * 365,
              },
              cacheableResponse: {
                statuses: [0, 200],
              },
            },
          },
        ],
      },
      
    }),
  ],
})


// https://vite.dev/config/
