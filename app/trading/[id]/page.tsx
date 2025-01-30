/* eslint-disable @typescript-eslint/ban-ts-comment */
//@ts-nocheck
import { redirect } from "next/navigation";
import prisma from "@/lib/prisma";
import { validateRequest } from "@/lib/auth";
import { Suspense } from "react";
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
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const { user } = await validateRequest();
  if (!user) {
    redirect("/auth/login");
  }

  const currentSymbol = await prisma.symbol.findFirst({
    where: { id: parseInt(id), enabled: true },
  });

  if (!currentSymbol) {
    redirect("/trading/1"); // Default symbol
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
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 md:h-full relative">
                {/* Chart Section */}
                <section className="lg:col-span-10 relative h-full flex flex-col">
                  <div className="flex-grow">
                    <Suspense fallback={<div>Loading chart...</div>}>
                      <TradingViewChart
                        symbols={symbols}
                        currentSymbol={currentSymbol}
                        symbolId={currentSymbol.id}
                      />
                    </Suspense>
                  </div>
                </section>

                {/* Trading Panel Section */}
                <section className="lg:col-span-2 space-y-4 overflow-y-auto">
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
