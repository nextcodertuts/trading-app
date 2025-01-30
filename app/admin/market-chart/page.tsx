import { SymbolSelector } from "@/components/SymbolSelector";
import { TradingViewChart } from "@/components/TradingViewChart";
import { TradingProvider } from "@/lib/trading-context";

import { Suspense } from "react";

export default function page() {
  return (
    <TradingProvider>
      <div className="flex h-screen bg-background">
        <main className="flex-1 p-4 overflow-hidden">
          <div className="grid grid-cols-12 gap-4 h-full relative">
            {/* Chart Section */}
            <section className="col-span-10 relative">
              <div className="space-y-4 h-[calc(100vh-2rem)]">
                <Suspense fallback={<div>Loading chart...</div>}>
                  <SymbolSelector />
                </Suspense>
                <Suspense fallback={<div>Loading chart...</div>}>
                  <TradingViewChart />
                </Suspense>
              </div>
            </section>
          </div>
        </main>
      </div>
    </TradingProvider>
  );
}
