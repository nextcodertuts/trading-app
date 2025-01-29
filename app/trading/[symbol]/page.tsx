import { redirect } from "next/navigation";
import prisma from "@/lib/prisma";
import { validateRequest } from "@/lib/auth";
import { TradingViewChart } from "@/components/TradingViewChart";
import { LivePriceDisplay } from "@/components/trading/LivePriceDisplay";
import { Balance } from "@/components/user-dashboard/Balance";
import { TradingActionPanel } from "@/components/user-dashboard/TradingActionPanel";
import { OpenTrades } from "@/components/OpenTrades";
import { TradeHistory } from "@/components/TradeHistory";
import { SymbolSelector } from "@/components/trading/SymbolSelector";

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

  const tempSymbol = await prisma.symbol.findFirst({
    where: { binanceSymbol: symbol, enabled: true },
  });

  if (!tempSymbol) {
    redirect("/trading/BTCUSDT"); // Default symbol
  }

  const symbols = await prisma.symbol.findMany({
    where: { enabled: true },
    orderBy: { name: "asc" },
  });

  return (
    <div className="flex h-screen bg-background">
      <main className="flex-1 p-4 overflow-hidden">
        <div className="grid grid-cols-12 gap-4 h-full relative">
          {/* Chart Section */}
          <section className="col-span-10 relative">
            <SymbolSelector symbols={symbols} currentSymbol={symbol} />
            <div className="space-y-4 h-[calc(100vh-2rem)]">
              <TradingViewChart symbol={symbol} />
            </div>
          </section>

          {/* Trading Panel Section */}
          <section className="col-span-2 space-y-4">
            <div className="h-full space-y-4">
              <Balance userId={user.id} />
              <LivePriceDisplay symbol={symbol} />
              <TradingActionPanel symbol={symbol} />
              <OpenTrades userId={user.id} />
              <TradeHistory userId={user.id} />
            </div>
          </section>
        </div>
      </main>
    </div>
  );
}
