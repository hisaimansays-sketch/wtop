import type { PlasmoCSConfig } from "plasmo"
import type { BrowserMetrics, MemoryMetrics, Metadata, NetworkMetrics, PageMetrics } from "./shared/types";

export const config: PlasmoCSConfig = {
    matches: ["https://*/*"],
    all_frames: true,
    world: "MAIN",
    run_at: "document_end"
}

export const metadata: Metadata = {
    title: document.title,
    url: document.documentURI || window.location.href,
    protocol: document.location.protocol || window.location.protocol,
    charset: document.characterSet,
    dimensions:
        `${window.innerWidth} x ${window.innerHeight}`,
    devicePixelRatio: window.devicePixelRatio,
    browser: navigator.userAgent,
    platform: navigator.userAgentData?.platform || navigator.platform,
    favicon:
        document.querySelector('link[rel="icon"]')?.href ||
        document.querySelector('link[rel="shortcut icon"]')?.href ||
        document.querySelector('link[rel*="icon"]')?.href ||
        null,
    secure: window.location.protocol === "https:",
    framework: detectFramework(),
    cssFramework: detectCssFramework()
};

// Detect JavaScript Framework
function detectFramework() {
    if (window.React || window.__REACT_DEVTOOLS_GLOBAL_HOOK__) return "React";
    if (window.angular) return "AngularJS";
    if (window.ng) return "Angular";
    if (window.Vue || document.querySelector("[data-v-app]")) return "Vue";
    if (window.__NEXT_DATA__) return "Next.js";
    if (window.__NUXT__) return "Nuxt.js";
    if (window.Svelte || document.querySelector("[data-sveltekit]")) return "Svelte";
    if (window.Ember) return "Ember";
    if (window.Backbone) return "Backbone";
    if (window.Alpine) return "Alpine.js";
    return null;
}

// Detect CSS Framework
function detectCssFramework() {
    const links = [...document.styleSheets]
        .map(s => s.href || "")
        .join(" ")
        .toLowerCase();

    if (links.includes("bootstrap")) return "Bootstrap";
    if (links.includes("tailwind")) return "Tailwind CSS";
    if (links.includes("bulma")) return "Bulma";
    if (links.includes("foundation")) return "Foundation";
    if (links.includes("materialize")) return "Materialize";
    if (links.includes("semantic")) return "Semantic UI";

    // Heuristics
    if (document.querySelector(".container, .row, .col")) return "Bootstrap (possible)";
    if (document.querySelector("[class*='tw-'], [class*='md:'], [class*='lg:']"))
        return "Tailwind CSS (possible)";

    return null;
}


export async function collectPageMetrics(): Promise<PageMetrics> {
    const nav = performance.getEntriesByType(
        "navigation"
    )[0] as PerformanceNavigationTiming;

    const metrics: PageMetrics = {
        navigationStart: 0,

        dnsLookup: nav.domainLookupEnd - nav.domainLookupStart,

        tcpConnect: nav.connectEnd - nav.connectStart,

        tlsHandshake:
            nav.secureConnectionStart > 0
                ? nav.connectEnd - nav.secureConnectionStart
                : 0,

        ttfb: nav.responseStart,

        domContentLoaded: nav.domContentLoadedEventEnd,

        loadEvent: nav.loadEventEnd,

        domNodes: document.getElementsByTagName("*").length,

        longTasks: 0,

        navigationType: nav.type,
    };

    // First Paint / FCP
    performance
        .getEntriesByType("paint")
        .forEach((entry: PerformanceEntry) => {
            if (entry.name === "first-paint") {
                metrics.firstPaint = entry.startTime;
            }

            if (entry.name === "first-contentful-paint") {
                metrics.firstContentfulPaint = entry.startTime;
            }
        });

    // Largest Contentful Paint
    await new Promise<void>((resolve) => {
        const observer = new PerformanceObserver((list) => {
            const entries = list.getEntries();
            const last = entries[entries.length - 1];
            if (last) {
                metrics.largestContentfulPaint = last.startTime;
            }
        });

        observer.observe({
            type: "largest-contentful-paint",
            buffered: true,
        });

        requestAnimationFrame(() => {
            observer.disconnect();
            resolve();
        });
    });

    // CLS
    await new Promise<void>((resolve) => {
        let cls = 0;

        const observer = new PerformanceObserver((list) => {
            for (const entry of list.getEntries() as any) {
                if (!entry.hadRecentInput) {
                    cls += entry.value;
                }
            }
            metrics.cls = cls;
        });

        observer.observe({
            type: "layout-shift",
            buffered: true,
        });

        requestAnimationFrame(() => {
            observer.disconnect();
            resolve();
        });
    });

    // INP
    await new Promise<void>((resolve) => {
        let max = 0;

        const observer = new PerformanceObserver((list) => {
            for (const entry of list.getEntries() as any) {
                max = Math.max(max, entry.duration);
            }
            metrics.inp = max;
        });

        observer.observe({
            type: "event",
            buffered: true,
            durationThreshold: 16,
        });

        setTimeout(() => {
            observer.disconnect();
            resolve();
        }, 0);
    });

    // Long Tasks
    await new Promise<void>((resolve) => {
        let count = 0;

        const observer = new PerformanceObserver((list) => {
            count += list.getEntries().length;
            metrics.longTasks = count;
        });

        observer.observe({
            type: "longtask",
            buffered: true,
        });

        requestAnimationFrame(() => {
            observer.disconnect();
            resolve();
        });
    });

    // Approximate FPS
    metrics.fps = await new Promise<number>((resolve) => {
        let frames = 0;
        const start = performance.now();

        function frame(now: number) {
            frames++;
            if (now - start >= 1000) {
                resolve(Math.round((frames * 1000) / (now - start)));
            } else {
                requestAnimationFrame(frame);
            }
        }

        requestAnimationFrame(frame);
    });

    console.log({ metrics });
    return metrics;
}

export function getMemoryMetrics(): MemoryMetrics {
    const metrics: MemoryMetrics = {
        domNodes: document.getElementsByTagName("*").length,
    };

    const memory = (performance as any).memory;

    if (memory) {
        metrics.jsHeapUsed = memory.usedJSHeapSize;
        metrics.jsHeapTotal = memory.totalJSHeapSize;
        metrics.jsHeapLimit = memory.jsHeapSizeLimit;

        metrics.heapUsage =
            (memory.usedJSHeapSize / memory.totalJSHeapSize) * 100;
    }

    console.log({ metrics })
    return metrics;
}

export function getNetworkMetrics(): NetworkMetrics {
    const resources = performance.getEntriesByType(
        "resource"
    ) as PerformanceResourceTiming[];

    const downloaded = resources.reduce(
        (sum, r) => sum + r.decodedBodySize,
        0
    );

    const redirects = resources.filter(
        (r) => r.redirectEnd > r.redirectStart
    ).length;

    const cacheHits = resources.filter(
        (r) => r.transferSize === 0 && r.decodedBodySize > 0
    ).length;

    const resourceBreakdown = resources.reduce((acc, r) => {
        const type = r.initiatorType || "other";
        acc[type] = (acc[type] ?? 0) + 1;
        return acc;
    }, {} as Record<string, number>);

    console.log({
        totalRequests: resources.length,
        requestRate:
            resources.length / (performance.now() / 1000),
        downloaded,
        resourceBreakdown,
        redirects,
        cacheHits,
    })
    return {
        totalRequests: resources.length,
        requestRate:
            resources.length / (performance.now() / 1000),
        downloaded,
        resourceBreakdown,
        redirects,
        cacheHits,
    };
}

export function getBrowserMetrics(): BrowserMetrics {
    return {
        domNodes: document.getElementsByTagName("*").length,

        cookies: document.cookie
            ? document.cookie.split(";").length
            : 0,

        localStorage: localStorage.length,

        sessionStorage: sessionStorage.length,

        historyLength: history.length,

        iframes: document.getElementsByTagName("iframe").length,

        scripts: document.scripts.length,

        stylesheets: document.styleSheets.length,

        serviceWorker: !!navigator.serviceWorker?.controller,

        online: navigator.onLine,

        visibilityState: document.visibilityState,

        focused: document.hasFocus(),
    };
}
