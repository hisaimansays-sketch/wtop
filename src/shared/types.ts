export interface Metadata {
    title: String,
    framework?: String,
    cssFramework?: String,
    charset: String,
    dimensions: String,
    protocol: String,
    secure: boolean,
}

// Performance
export type PageMetrics = {
    dnsLookup: number;
    tcpConnect: number;
    tlsHandshake: number;
    ttfb: number;
    domContentLoaded: number;
    loadEvent: number;
    longTasks: number;
    navigationType: string;
    domNodes: number;
    firstPaint?: number;
    firstContentfulPaint?: number;
    largestContentfulPaint?: number;
    cls?: number;
    inp?: number;
    fps?: number;
};

// Memory
export type MemoryMetrics = {
    jsHeapUsed?: number;
    jsHeapTotal?: number;
    jsHeapLimit?: number;
    heapUsage?: number;
};

// Network
export type NetworkMetrics = {
    totalRequests: number;
    requestRate: number;
    downloaded: number; // bytes
    resourceBreakdown: Record<string, number>;
    redirects: number;
    cacheHits: number;
};

// Runtime
export type BrowserMetrics = {
    domNodes: number;
    cookies: number;
    localStorage: number;
    sessionStorage: number;
    historyLength: number;
    scripts: number;
    stylesheets: number;
    serviceWorker: boolean;
    online: boolean;
    visibilityState: DocumentVisibilityState;
    focused: boolean;
};