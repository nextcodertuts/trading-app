"use client";

// Helper function to generate random price
const getRandomPrice = (basePrice: number, volatility: number) => {
  return basePrice * (1 + volatility * (Math.random() - 0.5));
};

// Generate historical data
const generateHistoricalData = (basePrice: number, bars: number) => {
  const data = [];
  let currentPrice = basePrice;
  const now = new Date();
  for (let i = bars - 1; i >= 0; i--) {
    const time = new Date(now.getTime() - i * 60000); // 1 minute intervals
    currentPrice = getRandomPrice(currentPrice, 0.002); // 0.2% volatility
    data.push({
      time: time.getTime() / 1000,
      open: currentPrice,
      high: currentPrice * 1.001,
      low: currentPrice * 0.999,
      close: currentPrice,
      volume: Math.floor(Math.random() * 100),
    });
  }
  return data;
};

export function createCustomDatafeed(
  getCurrentPrice: () => number | null,
  getSymbolInfo: () => any
) {
  let lastBar: any = null;

  return {
    onReady: (callback: (config: any) => void) => {
      setTimeout(
        () =>
          callback({
            supported_resolutions: ["1", "5", "15", "30", "60", "D"],
            exchanges: [
              {
                value: "Custom",
                name: "Custom Exchange",
                desc: "Custom Exchange",
              },
            ],
            symbols_types: [{ name: "crypto", value: "crypto" }],
          }),
        0
      );
    },
    searchSymbols: (
      userInput: string,
      exchange: string,
      symbolType: string,
      onResultReadyCallback: (result: any[]) => void
    ) => {
      const symbolInfo = getSymbolInfo();
      onResultReadyCallback([symbolInfo]);
    },
    resolveSymbol: (
      symbolName: string,
      onSymbolResolvedCallback: (symbolInfo: any) => void,
      onResolveErrorCallback: (reason: string) => void
    ) => {
      const symbolInfo = getSymbolInfo();
      if (symbolInfo) {
        onSymbolResolvedCallback({
          name: symbolInfo.name,
          description: symbolInfo.displayName,
          type: "crypto",
          session: "24x7",
          timezone: "Etc/UTC",
          exchange: "Custom",
          minmov: 1,
          pricescale: 100,
          has_intraday: true,
          supported_resolutions: ["1", "5", "15", "30", "60", "D"],
          volume_precision: 8,
          data_status: "streaming",
        });
      } else {
        onResolveErrorCallback("Symbol not found");
      }
    },
    getBars: (
      symbolInfo: any,
      resolution: string,
      periodParams: any,
      onHistoryCallback: (bars: any[], meta: { noData: boolean }) => void,
      onErrorCallback: (reason: string) => void
    ) => {
      const { from, to, countBack } = periodParams;
      const currentPrice = getCurrentPrice();
      if (currentPrice !== null) {
        const bars = generateHistoricalData(currentPrice, countBack);
        lastBar = bars[bars.length - 1];
        onHistoryCallback(bars, { noData: false });
      } else {
        onHistoryCallback([], { noData: true });
      }
    },
    subscribeBars: (
      symbolInfo: any,
      resolution: string,
      onRealtimeCallback: (bar: any) => void,
      subscriberUID: string,
      onResetCacheNeededCallback: () => void
    ) => {
      const intervalId = setInterval(() => {
        const currentPrice = getCurrentPrice();
        if (currentPrice !== null && lastBar !== null) {
          const nextBar = {
            time: Math.floor(Date.now() / 1000),
            open: lastBar.close,
            high: Math.max(lastBar.close, currentPrice),
            low: Math.min(lastBar.close, currentPrice),
            close: currentPrice,
            volume: Math.floor(Math.random() * 100),
          };
          onRealtimeCallback(nextBar);
          lastBar = nextBar;
        }
      }, 1000);

      return () => clearInterval(intervalId);
    },
    unsubscribeBars: (subscriberUID: string) => {
      // Unsubscribe logic here (if needed)
    },
  };
}
