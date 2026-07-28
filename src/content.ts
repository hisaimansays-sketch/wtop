import type { PlasmoCSConfig } from "plasmo"
import type { Metadata } from "./shared/types";

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
    viewport:
        document.querySelector('meta[name="viewport"]')?.getAttribute("content") ||
        null,
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
