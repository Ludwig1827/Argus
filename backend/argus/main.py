import uvicorn
import yfinance as yf
from dotenv import load_dotenv
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

# Imports
from backend.argus.crew import ArgusCrew
from backend.argus.tools.news_scraper import fetch_news_raw  # <--- Import the helper

load_dotenv()

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)


class AnalyzeRequest(BaseModel):
    ticker: str
    asset: str
    topics: str


@app.post("/analyze")
async def run_analysis(req: AnalyzeRequest):
    inputs = {"ticker": req.ticker, "asset": req.asset, "topics": req.topics}
    crew = ArgusCrew().crew()
    crew_output = await crew.kickoff_async(inputs=inputs)
    report_text = getattr(crew_output, "raw", "") or str(crew_output)
    return {"report": report_text}


# --- NEW ENDPOINT FOR UI NEWS BLOCK ---
@app.post("/news")
def get_news(req: AnalyzeRequest):
    articles = fetch_news_raw(req.topics)
    return {"articles": articles}


@app.get("/market-data/{ticker}")
def get_chart_data(ticker: str):
    try:
        df = yf.Ticker(ticker).history(period="3mo")
        data = []
        for index, row in df.iterrows():
            data.append(
                {
                    "time": index.strftime("%Y-%m-%d"),
                    "open": row["Open"],
                    "high": row["High"],
                    "low": row["Low"],
                    "close": row["Close"],
                }
            )
        return data
    except Exception as e:
        return {"error": str(e)}


if __name__ == "__main__":
    uvicorn.run("backend.argus.main:app", host="0.0.0.0", port=8000, reload=True)
