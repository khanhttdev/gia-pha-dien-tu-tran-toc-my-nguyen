/// <reference lib="webworker" />
import { defaultCache } from "@serwist/next/worker";
import type { PrecacheEntry, SerwistGlobalConfig, RuntimeCaching } from "serwist";
import { Serwist, NetworkFirst, CacheFirst } from "serwist";

declare global {
    interface WorkerGlobalScope extends SerwistGlobalConfig {
        __SW_MANIFEST: (PrecacheEntry | string)[] | undefined;
    }
}

declare const self: ServiceWorkerGlobalScope;

const supabaseCache: RuntimeCaching[] = [
    {
        // Cache API calls to Supabase (NetworkFirst: try network, fallback to cache if offline)
        matcher: /^https:\/\/.*\.supabase\.co\/rest\/v1\/.*/i,
        handler: new NetworkFirst({
            cacheName: 'supabase-api-cache',
            plugins: [
                {
                    cacheWillUpdate: async ({ response }) => {
                        return response && response.status === 200 ? response : null;
                    }
                }
            ],
            networkTimeoutSeconds: 5,
        }),
    },
    {
        // Cache media/avatars from Supabase Storage (CacheFirst: serve from cache, fetch if empty)
        matcher: /^https:\/\/.*\.supabase\.co\/storage\/v1\/object\/public\/.*/i,
        handler: new CacheFirst({
            cacheName: 'supabase-media-cache',
        }),
    }
];

const serwist = new Serwist({
    precacheEntries: self.__SW_MANIFEST,
    skipWaiting: true,
    clientsClaim: true,
    navigationPreload: true,
    runtimeCaching: [...supabaseCache, ...defaultCache],
});

serwist.addEventListeners();
