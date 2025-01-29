/* eslint-disable @typescript-eslint/no-explicit-any */
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
  id: number;
}

async function fetchHistoricalData(
  symbolId: number,
  from: number,
  to: number,
  resolution: string
): Promise<Bar[]> {
  const response = await fetch(
    `/api/historical-data?symbolId=${symbolId}&from=${from}&to=${to}&resolution=${resolution}`
  );
  if (!response.ok) throw new Error("Failed to fetch historical data");
  return await response.json();
}

export function createCustomDatafeed(
  getCurrentPrice: () => number | null,
  getSymbolInfo: () => SymbolInfo | null
) {
  let lastBar: Bar | null = null;
  // eslint-disable-next-line prefer-const
  let subscribers: { [key: string]: (bar: Bar) => void } = {};

  function updateRealtimeBar(symbolInfo: SymbolInfo, resolution: string) {
    const currentPrice = getCurrentPrice();
    if (currentPrice === null) return;

    const currentTime = Math.floor(Date.now() / 1000);
    const coeff = resolution === "D" ? 24 * 60 * 60 : parseInt(resolution) * 60;
    const rounded = Math.floor(currentTime / coeff) * coeff;

    let bar: Bar;

    if (lastBar && lastBar.time === rounded) {
      bar = {
        ...lastBar,
        high: Math.max(lastBar.high, currentPrice),
        low: Math.min(lastBar.low, currentPrice),
        close: currentPrice,
      };
    } else {
      bar = {
        time: rounded,
        open: currentPrice,
        high: currentPrice,
        low: currentPrice,
        close: currentPrice,
        volume: 0,
      };
    }

    lastBar = bar;

    Object.values(subscribers).forEach((callback) => callback(bar));
  }

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
      onResultReadyCallback(symbolInfo ? [symbolInfo] : []);
    },

    resolveSymbol: (
      symbolName: string,
      onSymbolResolvedCallback: (symbolInfo: SymbolInfo) => void,
      onResolveErrorCallback: (reason: string) => void
    ) => {
      const symbolInfo = getSymbolInfo();
      if (symbolInfo) {
        onSymbolResolvedCallback(symbolInfo);
      } else {
        onResolveErrorCallback("Symbol not found");
      }
    },

    getBars: async (
      symbolInfo: SymbolInfo,
      resolution: string,
      periodParams: any,
      onHistoryCallback: (bars: Bar[], meta: { noData: boolean }) => void,
      onErrorCallback: (error: string) => void
    ) => {
      try {
        const bars = await fetchHistoricalData(
          symbolInfo.id,
          periodParams.from,
          periodParams.to,
          resolution
        );
        if (bars.length > 0) {
          lastBar = bars[bars.length - 1];
        }
        onHistoryCallback(bars, { noData: bars.length === 0 });
      } catch (error) {
        console.error("Error fetching historical data:", error);
        onErrorCallback("Error fetching historical data");
      }
    },

    subscribeBars: (
      symbolInfo: SymbolInfo,
      resolution: string,
      onRealtimeCallback: (bar: Bar) => void,
      subscriberUID: string
    ) => {
      subscribers[subscriberUID] = onRealtimeCallback;
      setInterval(() => updateRealtimeBar(symbolInfo, resolution), 1000);
    },

    unsubscribeBars: (subscriberUID: string) => {
      delete subscribers[subscriberUID];
    },

    getServerTime: (callback: (serverTime: number) => void) => {
      callback(Math.floor(Date.now() / 1000));
    },
  };
}
