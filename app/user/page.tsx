import { Suspense } from "react";
import { BinaryTradeHistory } from "@/components/BinaryTradeHistory";
import { TradingViewChart } from "@/components/TradingViewChart";
import { TradingActionPanel } from "@/components/user-dashboard/TradingActionPanel";

export default function UserPage() {
  return (
    <div className="flex h-screen">
      <main className="flex-1 p-2 overflow-y-auto">
        <div className="grid grid-cols-10 gap-6 relative">
          <section className="col-span-8">
            <div className="space-y-4 h-full">
              <Suspense fallback={<div>Loading chart...</div>}>
                <TradingViewChart symbol="ETHUSDT" interval="1" height={600} />
              </Suspense>
            </div>
          </section>

          <section className="col-span-2 border space-y-4 min-h-[95vh] sticky rounded-lg p-4 bg-primary-foreground">
            <Suspense fallback={<div>Loading trading panel...</div>}>
              <TradingActionPanel />
            </Suspense>
            <Suspense fallback={<div>Loading history...</div>}>
              <BinaryTradeHistory />
            </Suspense>
          </section>
        </div>
      </main>
    </div>
  );
}
