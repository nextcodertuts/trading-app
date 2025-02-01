import { redirect } from "next/navigation";
import prisma from "@/lib/prisma";
import { validateRequest } from "@/lib/auth";
import { Suspense } from "react";
import { TradingViewChart } from "@/components/trading/TradingViewChart";
import { TradingActionPanel } from "@/components/trading/TradingActionPanel";
import { TradeHistory } from "@/components/trading/TradeHistory";

export default async function TradingPage({
  params,
}: {
  params: Promise<{ symbol: string }>;
}) {
  const { symbol } = await params;
  const { user } = await validateRequest();
  if (!user) {
    redirect("/auth/login");
  }

  // Get all enabled symbols
  const symbols = await prisma.symbol.findMany({
    where: { enabled: true },
    orderBy: { name: "asc" },
  });

  if (!symbols.length) {
    throw new Error("No trading symbols available");
  }

  // If no symbol in URL, redirect to first symbol
  if (!symbol) {
    redirect(`/trading/${symbols[0].name}`);
  }

  // Find the requested symbol
  const currentSymbol = symbols.find((s) => s.name === symbol) || symbols[0];

  return (
    <div className="flex h-[calc(100vh-3.5rem)] md:h-[calc(100vh-3.5rem)] bg-background">
      <main className="flex-1 p-2 overflow-hidden">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-2 h-full md:h-[98%] relative">
          {/* Chart Section */}
          <section className="lg:col-span-10 relative h-[78%] md:h-full flex flex-col">
            <div className="flex-grow">
              <Suspense fallback={<div>Loading chart...</div>}>
                <TradingViewChart
                  currentSymbol={currentSymbol}
                  symbols={symbols}
                />
              </Suspense>
            </div>
          </section>

          {/* Trading Panel Section */}
          <section className="lg:col-span-2 h-[22%] md:h-full">
            <div className="h-full space-y-4 md:flex md:flex-col md:justify-between">
              <Suspense fallback={<div>Loading trading panel...</div>}>
                <TradingActionPanel symbol={currentSymbol} />
              </Suspense>
              <div className="hidden md:block">
                <Suspense fallback={<div>Loading trade history...</div>}>
                  <TradeHistory />
                </Suspense>
              </div>
            </div>
          </section>
        </div>
      </main>
    </div>
  );
}
