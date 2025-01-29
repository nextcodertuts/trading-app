/* eslint-disable prefer-const */
/* eslint-disable @typescript-eslint/no-explicit-any */
// lib/customDatafeed.ts

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

    getBars: async (
      symbolInfo: any,
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
      symbolInfo: any,
      resolution: string,
      onRealtimeCallback: (bar: Bar) => void,
      subscriberUID: string
    ) => {
      subscribers[subscriberUID] = onRealtimeCallback;

      const intervalMs = getIntervalInMs(resolution);

      const intervalId = setInterval(() => {
        const currentPrice = getCurrentPrice();
        if (currentPrice !== null && lastBar !== null) {
          const time = Math.floor(Date.now() / 1000);

          if (time - lastBar.time < intervalMs / 1000) {
            // Update the current bar
            lastBar.high = Math.max(lastBar.high, currentPrice);
            lastBar.low = Math.min(lastBar.low, currentPrice);
            lastBar.close = currentPrice;
          } else {
            // Create a new bar
            const newBar = {
              time: time - (time % (intervalMs / 1000)),
              open: lastBar.close,
              high: currentPrice,
              low: currentPrice,
              close: currentPrice,
              volume: 0,
            };
            onRealtimeCallback(newBar);
            lastBar = newBar;
          }

          onRealtimeCallback(lastBar);
        }
      }, 1000); // Update every second

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
function getIntervalInMs(resolution: string): number {
  switch (resolution) {
    case "15S":
      return 15 * 1000;
    case "30S":
      return 30 * 1000;
    case "1":
      return 60 * 1000;
    case "3":
      return 3 * 60 * 1000;
    case "5":
      return 5 * 60 * 1000;
    case "15":
      return 15 * 60 * 1000;
    case "30":
      return 30 * 60 * 1000;
    case "60":
      return 60 * 60 * 1000;
    case "120":
      return 120 * 60 * 1000;
    case "240":
      return 240 * 60 * 1000;
    case "D":
      return 24 * 60 * 60 * 1000;
    default:
      return 60 * 1000; // Default to 1 minute
  }
}
