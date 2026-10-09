import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';

export default defineConfig({
  base: './',
  plugins: [react(), VitePWA({
    registerType: 'prompt',
    includeAssets: ['icons/*.png', 'icons/*.svg'],
    manifest: {
      name: '세연이의 냠냠 동물식당', short_name: '냠냠 식당', lang: 'ko',
      description: '동물 친구들에게 맛있는 밥을 주어요',
      theme_color: '#fff8ee', background_color: '#fff8ee',
      display: 'standalone', orientation: 'portrait', start_url: './', scope: './',
      icons: [
        { src: 'icons/icon-192.png', sizes: '192x192', type: 'image/png', purpose: 'any' },
        { src: 'icons/icon-512.png', sizes: '512x512', type: 'image/png', purpose: 'any' },
        { src: 'icons/icon-maskable.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' }
      ]
    },
    workbox: { globPatterns: ['**/*.{js,css,html,png,svg,webmanifest}'], cleanupOutdatedCaches: true, clientsClaim: true }
  })],
  test: { include: ['tests/unit/**/*.test.ts'] }
});
