import json
import os

import requests
from crewai import LLM
from crewai.tools import BaseTool

llm = LLM(
    model="gemini/gemini-2.5-flash", temperature=0, api_key=os.getenv("GOOGLE_API_KEY")
)


def batch_analyze_sentiment(articles, topic):
    if not articles:
        return []

    # Prepare input for LLM
    headlines_for_llm = [
        {"id": i, "text": f"{a['title']} - {a['snippet']}"}
        for i, a in enumerate(articles)
    ]

    # --- UPDATED PROMPT: Request Summary ---
    prompt = f"""
    You are a Senior Futures Analyst. 
    Topic: "{topic}"
    
    Task:
    1. Analyze the sentiment (Bullish/Bearish/Neutral).
    2. Write a CONCISE summary (max 12 words) of the event. remove clickbait. 
       Focus on the facts (numbers, events, outcomes).

    Headlines:
    {json.dumps(headlines_for_llm)}
    
    CRITICAL OUTPUT FORMAT:
    Return ONLY a valid JSON list. 
    Example: [{{ "id": 0, "sentiment": "Bullish", "summary": "Oil prices jumped 2% after OPEC announced cuts." }}]
    """

    try:
        response = llm.call(messages=[{"role": "user", "content": prompt}])

        # Clean response
        clean_json = response.replace("```json", "").replace("```", "").strip()
        sentiment_data = json.loads(clean_json)

        # Map results back
        data_map = {item["id"]: item for item in sentiment_data}

        for i, article in enumerate(articles):
            processed = data_map.get(i, {})
            article["sentiment"] = processed.get("sentiment", "Neutral")
            article["summary"] = processed.get(
                "summary", article["title"]
            )  # Fallback to title if fails

        return articles

    except Exception as e:
        print(f"⚠️ LLM Error: {e}")
        for article in articles:
            article["sentiment"] = "Neutral"
            article["summary"] = article["title"]
        return articles


def fetch_news_raw(query: str):
    url = "https://google.serper.dev/search"
    payload = {"q": query, "num": 6, "tbs": "qdr:d"}  # qdr:d = last 24h
    headers = {
        "X-API-KEY": os.getenv("SERPER_API_KEY", ""),
        "Content-Type": "application/json",
    }

    try:
        response = requests.post(url, headers=headers, json=payload)
        results = response.json().get("organic", [])

        # Pass raw results (which include 'date') to LLM for processing
        return batch_analyze_sentiment(results, query)
    except Exception as e:
        print(f"Error fetching news: {e}")
        return []


class NewsScraperTool(BaseTool):
    name: str = "News Search"
    description: str = "Search for latest news."

    def _run(self, query: str) -> str:
        results = fetch_news_raw(query)
        output = ""
        for r in results:
            output += (
                f"Summary: {r.get('summary')}\nSentiment: {r.get('sentiment')}\n---\n"
            )
        return output
