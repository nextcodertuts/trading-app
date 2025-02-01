// lib/binance.ts
export async function getBinancePrice(symbol: string): Promise<number> {
  try {
    const response = await fetch(
      `https://api.binance.com/api/v3/ticker/price?symbol=${symbol.toUpperCase()}`
    );
    const data = await response.json();
    return parseFloat(data.price);
  } catch (error) {
    console.error("Error fetching Binance price:", error);
    throw new Error("Failed to fetch price from Binance");
  }
}
