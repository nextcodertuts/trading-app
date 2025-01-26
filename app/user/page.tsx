import { BinaryTradeHistory } from "@/components/BinaryTradeHistory";
import { LivePriceDisplay } from "@/components/user-dashboard/LivePriceDisplay";
import { TradingActionPanel } from "@/components/user-dashboard/TradingActionPanel";

export default async function UserPage() {
  return (
    <div className="flex h-screen">
      {/* Main Dashboard */}
      <main className="flex-1  p-2 overflow-y-auto">
        {/* Trading Dashboard */}
        <div className="grid grid-cols-10 gap-6 relative">
          {/* Live Price and Chart */}
          <section className="col-span-8">
            <LivePriceDisplay />
          </section>

          {/* Trading Action Panel */}
          <section className="col-span-2 border space-y-4 min-h-[95vh] sticky rounded-lg p-4 bg-primary-foreground">
            <TradingActionPanel />
            <BinaryTradeHistory />
          </section>
        </div>
      </main>
    </div>
  );
}
