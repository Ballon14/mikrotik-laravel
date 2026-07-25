import { defineConfig } from 'vite';
import laravel from 'laravel-vite-plugin';
import tailwindcss from '@tailwindcss/vite';
import { VitePWA } from 'vite-plugin-pwa';

export default defineConfig({
    plugins: [
        laravel({
            input: ['resources/css/app.css', 'resources/js/app.js'],
            refresh: true,
        }),
        tailwindcss(),
        VitePWA({
            registerType: 'autoUpdate',
            includeAssets: ['favicon.ico', 'apple-touch-icon.png', 'pwa-192x192.png', 'pwa-512x512.png'],
            manifest: {
                name: 'MikroTik Billing & Monitor',
                short_name: 'MikroTik',
                description: 'MikroTik Router Billing & Monitoring Dashboard',
                theme_color: '#0a0e1a',
                background_color: '#0a0e1a',
                display: 'standalone',
                orientation: 'portrait',
                scope: '/',
                start_url: '/',
                icons: [
                    { src: '/pwa-192x192.png', sizes: '192x192', type: 'image/png' },
                    { src: '/pwa-512x512.png', sizes: '512x512', type: 'image/png' },
                    { src: '/pwa-512x512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' },
                ],
            },
            workbox: {
                globPatterns: ['**/*.{js,css,html,ico,png,svg,woff,woff2}'],
                runtimeCaching: [
                    {
                        urlPattern: /^\/api\/billing\/dashboard/,
                        handler: 'NetworkFirst',
                        options: {
                            cacheName: 'billing-dashboard-cache',
                            expiration: { maxEntries: 1, maxAgeSeconds: 300 },
                        },
                    },
                    {
                        urlPattern: /^\/api\/(router|identity|interfaces|health|daemon-status)/,
                        handler: 'NetworkFirst',
                        options: {
                            cacheName: 'monitoring-cache',
                            expiration: { maxEntries: 20, maxAgeSeconds: 120 },
                        },
                    },
                ],
            },
        }),
    ],
    server: {
        watch: {
            ignored: ['**/storage/framework/views/**'],
        },
    },
});
