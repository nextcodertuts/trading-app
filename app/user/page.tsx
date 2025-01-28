// app/user/page.tsx
import { Suspense } from "react";
import { TradeHistory } from "@/components/TradeHistory";
import { TradingViewChart } from "@/components/TradingViewChart";
import { TradingActionPanel } from "@/components/user-dashboard/TradingActionPanel";
import { SymbolSelector } from "@/components/user-dashboard/SymbolSelector";
import { LivePriceDisplay } from "@/components/user-dashboard/LivePriceDisplay";
import { Balance } from "@/components/user-dashboard/Balance";
import { OpenTrades } from "@/components/OpenTrades";

export default function UserPage() {
  return (
    <div className="flex h-screen bg-background">
      <main className="flex-1 p-4 overflow-hidden">
        <div className="grid grid-cols-12 gap-4 h-full relative">
          {/* Chart Section */}
          <section className="col-span-10 relative">
            <Suspense fallback={<div>Loading symbol selector...</div>}>
              <SymbolSelector />
            </Suspense>
            <div className="space-y-4 h-[calc(100vh-2rem)]">
              <Suspense fallback={<div>Loading chart...</div>}>
                <TradingViewChart />
              </Suspense>
            </div>
          </section>

          {/* Trading Panel Section */}
          <section className="col-span-2 space-y-4">
            <div className="h-full space-y-4">
              <Suspense fallback={<div>Loading balance...</div>}>
                <Balance />
              </Suspense>

              <Suspense fallback={<div>Loading price display...</div>}>
                <LivePriceDisplay />
              </Suspense>

              <Suspense fallback={<div>Loading trading panel...</div>}>
                <TradingActionPanel />
              </Suspense>

              <Suspense fallback={<div>Loading open trades...</div>}>
                <OpenTrades />
              </Suspense>

              <Suspense fallback={<div>Loading history...</div>}>
                <TradeHistory />
              </Suspense>
            </div>
          </section>
        </div>
      </main>
    </div>
  );
}
