import { getStockMetrics } from "../services/geminiService.js";

export async function getStock(req, res) {
  try {
    const symbol = req.params.symbol.toUpperCase();
    const stockData = await getStockMetrics(symbol);
    res.json({ stockData });
  } catch (err) {
    console.error(err);
    res
      .status(500)
      .json({ error: err.message || "Failed to process stock data request." });
  }
}

export async function analyzeStock(req, res) {
  try {
    const symbol = req.params.symbol.toUpperCase();
    const stockData = await getStockMetrics(symbol);

    const prompt = `Analyze the stock ${stockData.stockName} (${symbol}) based on these metrics:
- Current Price: $${stockData.currentPrice}
- Day High: $${stockData.dayHigh}
- Day Low: $${stockData.dayLow}
- P/E Ratio: ${stockData.peRatio}
- ROE: ${stockData.roe}
- Debt/Equity: ${stockData.debtToEquity}
- Profit Margin: ${stockData.profitMargins}
- Revenue Growth: ${stockData.revenueGrowth}

Give your recommendation:
Line 1: ONE word recommendation (BUY, SELL, or HOLD)
Line 2: A confidence percentage (e.g., 85)
Do not include any explanation.`;

    const result = await req.app.locals.geminiModel.generateContent(prompt);
    const geminiResponse = result.response.text();

    res.json({ geminiResponse });
  } catch (error) {
    console.error("Analysis error:", error);
    res.status(500).json({ error: "AI analysis failed. " + error.message });
  }
}

