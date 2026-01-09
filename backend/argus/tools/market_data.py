import yfinance as yf
from crewai.tools import BaseTool


class MarketDataTool(BaseTool):
    name: str = "Market Data Fetcher"
    description: str = "Fetches recent price action for a ticker."

    def _run(self, ticker: str) -> str:
        try:
            data = yf.Ticker(ticker)
            hist = data.history(period="1mo")
            if hist.empty:
                return "No data found."

            # Calculate simple stats
            current = hist["Close"].iloc[-1]
            prev = hist["Close"].iloc[-2]
            change = ((current - prev) / prev) * 100

            return f"Asset: {ticker} | Price: {current:.2f} | 24h Change: {change:.2f}% | 30d Low: {hist['Low'].min():.2f} | 30d High: {hist['High'].max():.2f}"
        except Exception as e:
            return f"Error fetching market data: {str(e)}"
