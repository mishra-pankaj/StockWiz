import dotenv from "dotenv";
dotenv.config();

const stockCache = new Map();
const CACHE_TTL = 5 * 60 * 1000;

const API_KEY = process.env.FINNHUB_API_KEY;

export async function getStockMetrics(stockSymbol) {
  const cached = stockCache.get(stockSymbol);

  if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
    console.log(`[CACHE] Returning cached data for ${stockSymbol}`);
    return cached.data;
  }

  try {
    console.log(`[FINNHUB] Fetching data for ${stockSymbol}`);

    // Parallel API calls
    const [quoteRes, profileRes, metricRes] = await Promise.all([
      fetch(
        `https://finnhub.io/api/v1/quote?symbol=${stockSymbol}&token=${API_KEY}`
      ),
      fetch(
        `https://finnhub.io/api/v1/stock/profile2?symbol=${stockSymbol}&token=${API_KEY}`
      ),
      fetch(
        `https://finnhub.io/api/v1/stock/metric?symbol=${stockSymbol}&metric=all&token=${API_KEY}`
      ),
    ]);

    const quoteData = await quoteRes.json();
    const profileData = await profileRes.json();
    const metricData = await metricRes.json();

    console.log("[QUOTE DATA]", quoteData);
    console.log("[PROFILE DATA]", profileData);
    console.log("[METRIC DATA]", metricData);

    // Validate stock
    if (!quoteData.c || quoteData.c === 0) {
      throw new Error("Invalid stock symbol or no market data available");
    }

    const metrics = metricData.metric || {};

    const normalized = {
      stockName: profileData.name || stockSymbol,
      symbol: stockSymbol,

      currentPrice: quoteData.c || null,
      dayHigh: quoteData.h|| null,
      dayLow: quoteData.l || null,

      peRatio: metrics.peNormalizedAnnual || null,

      roe:
        metrics.roeTTM !== undefined
          ? metrics.roeTTM / 100
          : null,

      debtToEquity: metrics["totalDebt/totalEquityQuarterly"] || null,

      profitMargins:
        metrics.netProfitMarginTTM!== undefined
          ? metrics.netProfitMarginTTM / 100
          : null,

      revenueGrowth:
        metrics.revenueGrowthTTMYoy !== undefined
          ? metrics.revenueGrowthTTMYoy / 100
          : null,
    };

    stockCache.set(stockSymbol, {
      data: normalized,
      timestamp: Date.now(),
    });

    return normalized;
  } catch (error) {
    console.error("[FINNHUB ERROR]", error.message);

    throw new Error(
      `Failed to fetch stock data for ${stockSymbol}`
    );
  }
}

