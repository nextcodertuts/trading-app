interface Bar {
  time: number;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
}

interface SymbolInfo {
  name: string;
  displayName: string;
  minmov: number;
  pricescale: number;
  timezone: string;
  session: string;
  has_intraday: boolean;
  description: string;
  type: string;
  supported_resolutions: string[];
  volume_precision: number;
}

function generateHistoricalData(basePrice: number, bars: number): Bar[] {
  const data: Bar[] = [];
  let currentPrice = basePrice;
  const now = new Date();

  for (let i = bars - 1; i >= 0; i--) {
    const time = new Date(now.getTime() - i * 60000); // 1-minute intervals
    const volatility = 0.002; // 0.2% volatility
    const priceChange =
      currentPrice * (1 + (Math.random() * 2 - 1) * volatility);

    const bar: Bar = {
      time: Math.floor(time.getTime() / 1000),
      open: currentPrice,
      high: Math.max(currentPrice, priceChange),
      low: Math.min(currentPrice, priceChange),
      close: priceChange,
      volume: Math.floor(Math.random() * 100),
    };

    data.push(bar);
    currentPrice = priceChange;
  }

  return data;
}

export function createCustomDatafeed(
  getCurrentPrice: () => number | null,
  getSymbolInfo: () => any
) {
  let lastBar: Bar | null = null;
  let subscribers: { [key: string]: (bar: Bar) => void } = {};

  return {
    onReady: (callback: (configuration: any) => void) => {
      setTimeout(() => {
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
        });
      }, 0);
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
      onSymbolResolvedCallback: (symbolInfo: SymbolInfo) => void,
      onResolveErrorCallback: (reason: string) => void
    ) => {
      const symbolInfo = getSymbolInfo();
      if (symbolInfo) {
        onSymbolResolvedCallback({
          name: symbolInfo.name,
          displayName: symbolInfo.displayName,
          minmov: 1,
          pricescale: 100,
          timezone: "Etc/UTC",
          session: "24x7",
          has_intraday: true,
          description: symbolInfo.displayName,
          type: "crypto",
          supported_resolutions: ["1", "5", "15", "30", "60", "D"],
          volume_precision: 8,
        });
      } else {
        onResolveErrorCallback("Symbol not found");
      }
    },

    getBars: (
      symbolInfo: any,
      resolution: string,
      periodParams: any,
      onHistoryCallback: (bars: Bar[], meta: { noData: boolean }) => void,
      onErrorCallback: (error: string) => void
    ) => {
      const currentPrice = getCurrentPrice();
      if (currentPrice !== null) {
        const bars = generateHistoricalData(
          currentPrice,
          periodParams.countBack
        );
        lastBar = bars[bars.length - 1];
        onHistoryCallback(bars, { noData: false });
      } else {
        onHistoryCallback([], { noData: true });
      }
    },

    subscribeBars: (
      symbolInfo: any,
      resolution: string,
      onRealtimeCallback: (bar: Bar) => void,
      subscriberUID: string
    ) => {
      subscribers[subscriberUID] = onRealtimeCallback;

      const intervalId = setInterval(() => {
        const currentPrice = getCurrentPrice();
        if (currentPrice !== null && lastBar !== null) {
          const time = Math.floor(Date.now() / 1000);

          // Update existing bar if within the same minute
          if (Math.floor(lastBar.time / 60) === Math.floor(time / 60)) {
            lastBar.close = currentPrice;
            lastBar.high = Math.max(lastBar.high, currentPrice);
            lastBar.low = Math.min(lastBar.low, currentPrice);
          } else {
            // Create new bar
            lastBar = {
              time: time,
              open: lastBar.close,
              high: Math.max(lastBar.close, currentPrice),
              low: Math.min(lastBar.close, currentPrice),
              close: currentPrice,
              volume: Math.floor(Math.random() * 100),
            };
          }

          onRealtimeCallback(lastBar);
        }
      }, 1000);

      return () => {
        clearInterval(intervalId);
        delete subscribers[subscriberUID];
      };
    },

    unsubscribeBars: (subscriberUID: string) => {
      delete subscribers[subscriberUID];
    },
  };
}
