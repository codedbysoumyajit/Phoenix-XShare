// service-worker.js
// Important: Update Workbox CDN to the latest stable version.
// As of the current date (June 17, 2025), Workbox 7.x is common.
importScripts('https://storage.googleapis.com/workbox-cdn/releases/7.0.0/workbox-sw.js');

if (workbox) {
    console.log(`Workbox is loaded! Version: ${workbox.core.VERSION}`);

    // Set debugging to true during development. Remove or set to false in production.
    workbox.core.setCacheNameDetails({
        prefix: 'phoenix-xshare', // A unique prefix for your app's caches
        suffix: 'v1',          // Cache versioning
        precache: 'precache-assets', // Name for precache assets
        runtime: 'runtime-assets'    // Name for runtime cached assets
    });

    // 1. Precache your "App Shell" - the core UI assets
    // These are assets that make up your basic UI and should always be available offline.
    // Replace with the actual paths to your core HTML, CSS, JS, and essential icons.
    workbox.precaching.precacheAndRoute([
        // Core HTML pages
        { url: '/', revision: '1' }, // Home/Login page
        { url: '/view', revision: '1' }, // View page (might need specific route if dynamic)
        { url: '/download', revision: '1' }, // Download page (might need specific route if dynamic)
        { url: '/error', revision: '1' }, // Error page

        // Core CSS files
        { url: '/styles/login.css', revision: '1' },
        { url: '/styles/upload.css', revision: '1' },
        { url: '/styles/uploaded.css', revision: '1' },
        { url: '/styles/download.css', revision: '1' },
        { url: '/styles/view.css', revision: '1' },
        { url: '/styles/error.css', revision: '1' },

        // Core JavaScript files
        { url: '/scripts/registerSW.js', revision: '1' }, // Your service worker registration script
        { url: '/scripts/login.js', revision: '1' },
        { url: '/scripts/upload.js', revision: '1' },
        { url: '/scripts/download.js', revision: '1' },
        { url: '/scripts/view.js', revision: '1' },

        // Essential Icons and Manifest
        { url: '/icons/apple-touch-icon.png', revision: '1' },
        { url: '/icons/favicon-32x32.png', revision: '1' },
        { url: '/icons/favicon-16x16.png', revision: '1' },
        { url: '/icons/safari-pinned-tab.svg', revision: '1' },
        { url: '/icons/logo-trans.png', revision: '1' }, // Your main logo
        { url: '/site.webmanifest', revision: '1' },
        { url: '/browserconfig.xml', revision: '1' },
        { url: '/icons/phoenix-xshare-default-og.png', revision: '1' }, // Default OG image
    ]);

    // 2. Runtime Caching Strategies

    // Cache Google Fonts stylesheets: StaleWhileRevalidate (fastest response, updates in background)
    workbox.routing.registerRoute(
        new RegExp('https://fonts.googleapis.com/css'),
        new workbox.strategies.StaleWhileRevalidate({
            cacheName: 'google-fonts-stylesheets',
        })
    );

    // Cache Google Fonts webfonts: CacheFirst (high performance, fonts rarely change)
    workbox.routing.registerRoute(
        new RegExp('https://fonts.gstatic.com/s/'),
        new workbox.strategies.CacheFirst({
            cacheName: 'google-fonts-webfonts',
            plugins: [
                new workbox.cacheableResponse.CacheableResponsePlugin({
                    statuses: [0, 200], // Cache opaque responses (from third-party origins)
                }),
                new workbox.expiration.ExpirationPlugin({
                    maxAgeSeconds: 60 * 60 * 24 * 365, // 1 year
                    maxEntries: 30, // Limit entries to prevent cache bloat
                }),
            ],
        })
    );

    // Cache Bootstrap CSS and JS from CDN: StaleWhileRevalidate
    workbox.routing.registerRoute(
        new RegExp('https://cdn.jsdelivr.net/npm/bootstrap@5.3.2/'),
        new workbox.strategies.StaleWhileRevalidate({
            cacheName: 'bootstrap-cdn',
            plugins: [
                new workbox.cacheableResponse.CacheableResponsePlugin({
                    statuses: [0, 200],
                }),
                new workbox.expiration.ExpirationPlugin({
                    maxAgeSeconds: 60 * 60 * 24 * 30, // 30 days
                    maxEntries: 10,
                }),
            ],
        })
    );

    // Cache Bootstrap Icons CSS: StaleWhileRevalidate
    workbox.routing.registerRoute(
        new RegExp('https://cdn.jsdelivr.net/npm/bootstrap-icons@'),
        new workbox.strategies.StaleWhileRevalidate({
            cacheName: 'bootstrap-icons-cdn',
            plugins: [
                new workbox.cacheableResponse.CacheableResponsePlugin({
                    statuses: [0, 200],
                }),
                new workbox.expiration.ExpirationPlugin({
                    maxAgeSeconds: 60 * 60 * 24 * 30, // 30 days
                    maxEntries: 10,
                }),
            ],
        })
    );

    // Cache Workbox CDN itself (for registerSW.js if it uses it directly): CacheFirst
    workbox.routing.registerRoute(
        new RegExp('https://storage.googleapis.com/workbox-cdn/'),
        new workbox.strategies.CacheFirst({
            cacheName: 'workbox-cdn-assets',
            plugins: [
                new workbox.cacheableResponse.CacheableResponsePlugin({
                    statuses: [0, 200],
                }),
                new workbox.expiration.ExpirationPlugin({
                    maxAgeSeconds: 60 * 60 * 24 * 365, // 1 year
                    maxEntries: 5,
                }),
            ],
        })
    );

    // Cache Images (your logos, media previews, etc.): CacheFirst or StaleWhileRevalidate
    // CacheFirst for static images, StaleWhileRevalidate for potentially changing user-uploaded media previews
    workbox.routing.registerRoute(
        /\.(?:png|gif|jpg|jpeg|svg|webp)$/, // Match common image file extensions
        new workbox.strategies.StaleWhileRevalidate({ // Use SWR for balance
            cacheName: 'images-cache',
            plugins: [
                new workbox.expiration.ExpirationPlugin({
                    maxEntries: 50, // Cache up to 50 images
                    maxAgeSeconds: 60 * 60 * 24 * 7, // 7 days
                }),
            ],
        })
    );

    // Cache user-uploaded media (videos, audio, PDFs) from your /cdn route
    // Use CacheFirst for media if it's considered immutable once uploaded.
    // Or StaleWhileRevalidate if the server can update files with same URL.
    workbox.routing.registerRoute(
        new RegExp('/cdn/.*'), // Match any request to your /cdn route
        new workbox.strategies.CacheFirst({ // Cache user uploaded content for offline access
            cacheName: 'user-media-cache',
            plugins: [
                new workbox.expiration.ExpirationPlugin({
                    maxEntries: 100, // Cache up to 100 user media files
                    maxAgeSeconds: 60 * 60 * 24 * 30, // 30 days
                    purgeOnQuotaError: true, // Auto-delete if storage quota exceeded
                }),
                new workbox.rangeRequests.RangeRequestsPlugin(), // Enable range requests for media playback
            ],
        })
    );

    // 3. Offline Fallback Page
    // Serve a custom offline page when the user is completely offline and a requested page is not in cache.
    // Make sure you have an 'offline.html' or similar file in your precache list.
    const FALLBACK_HTML_URL = '/offline.html'; // Create this file and add to precache list above!

    workbox.routing.setDefaultHandler(new workbox.strategies.NetworkFirst()); // Default strategy for other requests

    // Create a new route for offline fallback
    workbox.routing.setCatchHandler(({ event }) => {
        switch (event.request.destination) {
            case 'document':
                return caches.match(FALLBACK_HTML_URL);
            case 'image':
                // Optional: Provide a generic offline image placeholder
                // return caches.match('/icons/offline-image.png');
            default:
                // If we don't have a fallback for the type of request,
                // we just let it go to the network (which will fail if offline)
                return Response.error();
        }
    });

    // 4. Lifecycle Management for Native-like Updates

    // This ensures that when a new service worker is installed, it immediately takes control
    // after the user navigates or refreshes, preventing stale content.
    // It's part of the standard Workbox update flow.
    self.addEventListener('install', (event) => {
        // Force the waiting service worker to activate
        event.waitUntil(self.skipWaiting());
        console.log('Service Worker installed and waiting to activate.');
    });

    self.addEventListener('activate', (event) => {
        // Clean up old caches from previous versions
        event.waitUntil(
            caches.keys().then((cacheNames) => {
                return Promise.all(
                    cacheNames.filter((cacheName) => {
                        // Delete caches that don't match the current prefix or suffix
                        return cacheName.startsWith(workbox.core.cacheNames.prefix) &&
                               !cacheName.endsWith(workbox.core.cacheNames.suffix);
                    }).map(cacheName => {
                        console.log(`Deleting old cache: ${cacheName}`);
                        return caches.delete(cacheName);
                    })
                );
            })
            .then(() => self.clients.claim()) // Take control of any uncontrolled clients
        );
        console.log('Service Worker activated and claimed clients.');
    });

    // This message listener allows the main page to tell the service worker to skip waiting
    // (e.g., from your registerSW.js, after detecting an update)
    self.addEventListener('message', (event) => {
        if (event.data && event.data.type === 'SKIP_WAITING') {
            self.skipWaiting();
            console.log('SKIP_WAITING message received. Service Worker is skipping waiting.');
        }
    });

} else {
    console.error('Workbox could not be loaded. Please check the network or CDN URL.');
}
