import { redirect } from "next/navigation";
import prisma from "@/lib/prisma";
import { validateRequest } from "@/lib/auth";
import { Suspense } from "react";
import { SymbolSelector } from "@/components/trading/SymbolSelector";
import { TradingViewChart } from "@/components/trading/TradingViewChart";
import { TradingActionPanel } from "@/components/trading/TradingActionPanel";
import { TradeHistory } from "@/components/trading/TradeHistory";
import { SymbolProvider } from "@/lib/symbol-context";
import { OrderProvider } from "@/lib/order-context";
import { Providers } from "@/app/providers";

export async function generateStaticParams() {
  const symbols = await prisma.symbol.findMany({
    where: { enabled: true },
    select: { name: true },
  });

  return symbols.map((symbol) => ({
    symbol: symbol.name,
  }));
}

export default async function TradingPage({
  params,
}: {
  params: { symbol: string };
}) {
  const { symbol } = params;

  const { user } = await validateRequest();
  if (!user) {
    redirect("/auth/login");
  }

  const currentSymbol = await prisma.symbol.findFirst({
    where: { binanceSymbol: symbol, enabled: true },
  });

  if (!currentSymbol) {
    redirect("/trading/BTCUSDT"); // Default symbol
  }

  const symbols = await prisma.symbol.findMany({
    where: { enabled: true },
    orderBy: { name: "asc" },
  });

  return (
    <Providers>
      <div className="flex h-screen bg-background">
        <main className="flex-1 p-4 overflow-hidden">
          <SymbolProvider>
            <OrderProvider>
              <div className="grid grid-cols-12 gap-4 h-full relative">
                {/* Chart Section */}
                <section className="col-span-8 relative">
                  <Suspense fallback={<div>Loading symbol selector...</div>}>
                    <SymbolSelector
                      symbols={symbols}
                      currentSymbol={currentSymbol}
                    />
                  </Suspense>
                  <div className="space-y-4 h-[calc(100vh-2rem)]">
                    <Suspense fallback={<div>Loading chart...</div>}>
                      <TradingViewChart symbolId={currentSymbol.id} />
                    </Suspense>
                  </div>
                </section>

                {/* Trading Panel Section */}
                <section className="col-span-4 space-y-4 overflow-y-auto">
                  <div className="space-y-4">
                    <Suspense fallback={<div>Loading trading panel...</div>}>
                      <TradingActionPanel />
                    </Suspense>

                    <Suspense fallback={<div>Loading trade history...</div>}>
                      <TradeHistory />
                    </Suspense>
                  </div>
                </section>
              </div>
            </OrderProvider>
          </SymbolProvider>
        </main>
      </div>
    </Providers>
  );
}
