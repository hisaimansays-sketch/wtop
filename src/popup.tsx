import { useEffect, useState } from "react"
import "./style.css"

import type { Data } from "./shared/types"

function Row({
  label,
  value
}: {
  label: string
  value: React.ReactNode
}) {
  return (
    <div className="grid grid-cols-[140px_1fr] gap-3">
      <span className="text-zinc-500">{label}</span>
      <span className="text-zinc-100 truncate">{value}</span>
    </div>
  )
}

function Section({
  title,
  children
}: {
  title: string
  children: React.ReactNode
}) {
  return (
    <section className="space-y-2">
      <h2 className="text-emerald-400 font-semibold">{title}</h2>
      <div className="border-t border-zinc-700 pt-2 space-y-1">
        {children}
      </div>
    </section>
  )
}

function IndexPopup() {
  const [data, setData] = useState<Data | null>(null)

  async function refresh() {
    const [tab] = await chrome.tabs.query({
      active: true,
      currentWindow: true
    })

    if (!tab.id) return

    try {
      const data = await chrome.tabs.sendMessage(tab.id, {
        type: "GET_DATA"
      })
      setData(data)
    } catch (err) {
      console.error(err)
    }
  }

  useEffect(() => {
    refresh()
    const id = setInterval(refresh, 1000)
    return () => clearInterval(id)
  }, [])

  if (!data) {
    return (
      <main className="w-[720px] h-[560px] bg-[#262626] flex items-center justify-center text-zinc-300 font-mono">
        Loading...
      </main>
    )
  }

  return (
    <main className="w-[720px] h-[560px] bg-[#262626] border border-zinc-700 text-xs font-mono text-zinc-200 p-4 overflow-y-auto">
      <header className="flex items-center justify-between border-b border-zinc-700 pb-3 mb-4">
        <h1 className="text-base font-bold text-white">WTOP v0.1.0</h1>
        <span className="text-zinc-500">Refresh: 1s</span>
      </header>

      <div className="grid grid-cols-2 gap-6">
        <Section title="Metadata">
          <Row label="Page" value={data.metadata.title} />
          <Row label="Framework" value={data.metadata.framework ?? "-"} />
          <Row label="CSS" value={data.metadata.cssFramework ?? "-"} />
          <Row label="Charset" value={data.metadata.charset} />
          <Row label="Viewport" value={data.metadata.dimensions} />
          <Row
            label="HTTPS"
            value={
              <span
                className={
                  data.metadata.secure ? "text-green-400" : "text-red-400"
                }>
                {data.metadata.secure ? "✓ Secure" : "✗ Insecure"}
              </span>
            }
          />
        </Section>

        <Section title="Performance">
          <Row label="TTFB" value={`${data.performance.ttfb} ms`} />
          <Row
            label="FCP"
            value={`${data.performance.firstContentfulPaint ?? "-"} ms`}
          />
          <Row
            label="LCP"
            value={`${data.performance.largestContentfulPaint ?? "-"} ms`}
          />
          <Row
            label="DOMContent"
            value={`${data.performance.domContentLoaded} ms`}
          />
          <Row
            label="Load"
            value={`${data.performance.loadEvent} ms`}
          />
          <Row
            label="Navigation"
            value={data.performance.navigationType}
          />
        </Section>

        <Section title="Memory">
          <Row
            label="Heap Used"
            value={`${data.memory.jsHeapUsed ?? "-"} MB`}
          />
          <Row
            label="Heap Total"
            value={`${data.memory.jsHeapTotal ?? "-"} MB`}
          />
          <Row
            label="Heap Limit"
            value={`${data.memory.jsHeapLimit ?? "-"} GB`}
          />

          <div className="space-y-1">
            <Row
              label="Usage"
              value={`${data.memory.heapUsage?.toFixed(1) ?? "-"}%`}
            />

            {data.memory.heapUsage != null && (
              <div className="h-2 rounded bg-zinc-800 overflow-hidden">
                <div
                  className="h-full bg-emerald-400"
                  style={{ width: `${data.memory.heapUsage}%` }}
                />
              </div>
            )}
          </div>
        </Section>

        <Section title="Network">
          <Row
            label="Requests"
            value={data.network.totalRequests}
          />
          <Row
            label="Rate"
            value={`${data.network.requestRate} req/s`}
          />
          <Row
            label="Downloaded"
            value={`${(data.network.downloaded / 1024 / 1024).toFixed(2)} MB`}
          />

          <div className="pt-2 space-y-1">
            {Object.entries(data.network.resourceBreakdown).map(
              ([type, count]) => (
                <Row
                  key={type}
                  label={type.toUpperCase()}
                  value={count}
                />
              )
            )}
          </div>
        </Section>

        <Section title="Runtime">
          <Row
            label="DOM Nodes"
            value={data.runtime.domNodes}
          />
          <Row
            label="Cookies"
            value={data.runtime.cookies}
          />
          <Row
            label="localStorage"
            value={data.runtime.localStorage}
          />
          <Row
            label="sessionStorage"
            value={data.runtime.sessionStorage}
          />
          <Row
            label="Scripts"
            value={data.runtime.scripts}
          />
          <Row
            label="Stylesheets"
            value={data.runtime.stylesheets}
          />
          <Row
            label="Service Worker"
            value={data.runtime.serviceWorker ? "Yes" : "No"}
          />
          <Row
            label="Online"
            value={data.runtime.online ? "Yes" : "No"}
          />
          <Row
            label="Visibility"
            value={data.runtime.visibilityState}
          />
          <Row
            label="Focused"
            value={data.runtime.focused ? "Yes" : "No"}
          />
        </Section>
      </div>
    </main>
  )
}

export default IndexPopup