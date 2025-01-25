"use client"

import { useEffect, useRef, useState } from "react"

let tvScriptLoadingPromise: Promise<void> | null = null

export default function TradingViewWidget() {
  const container = useRef<HTMLDivElement>(null)
  const [price, setPrice] = useState<string | null>(null)

  useEffect(() => {
    if (container.current) {
      const script = document.createElement("script")
      script.src = "https://s3.tradingview.com/external-embedding/embed-widget-advanced-chart.js"
      script.type = "text/javascript"
      script.async = true
      script.innerHTML = JSON.stringify({
        width: "100%",
        height: "400",
        symbol: "NASDAQ:AAPL",
        interval: "1",
        timezone: "Etc/UTC",
        theme: "light",
        style: "1",
        locale: "en",
        enable_publishing: false,
        allow_symbol_change: true,
        support_host: "https://www.tradingview.com",
      })

      if (!tvScriptLoadingPromise) {
        tvScriptLoadingPromise = new Promise((resolve) => {
          script.onload = resolve
        })
      }

      container.current.appendChild(script)
    }

    // Connect to WebSocket
    const ws = new WebSocket("ws://localhost:8080")

    ws.onmessage = (event) => {
      const data = JSON.parse(event.data)
      if (data.type === "price") {
        setPrice(data.data)
      }
    }

    return () => {
      if (container.current) {
        container.current.innerHTML = ""
      }
      ws.close()
    }
  }, [])

  return (
    <div>
      <div ref={container} className="tradingview-widget-container" />
      {price && <div className="mt-4 text-xl font-bold">Current Price: ${price}</div>}
    </div>
  )
}

