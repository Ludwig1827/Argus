import os

from crewai import LLM, Agent, Crew, Process, Task
from crewai.project import CrewBase, agent, crew, task
from dotenv import load_dotenv

from backend.argus.tools.market_data import MarketDataTool
from backend.argus.tools.news_scraper import NewsScraperTool

load_dotenv(override=True)


@CrewBase
class ArgusCrew:
    """Argus: Jesse Livermore Edition"""

    # Load YAML configs relative to this file
    agents_config = "config/agents.yaml"
    tasks_config = "config/tasks.yaml"

    def llm(self):
        return LLM(
            model="gemini/gemini-2.5-flash",  # Update to 'gemini-3.0-pro-preview' if available
            temperature=0.4,
            google_api_key=os.getenv("GOOGLE_API_KEY"),
        )

    @agent
    def market_data_analyst(self) -> Agent:
        return Agent(
            config=self.agents_config["market_data_analyst"],
            tools=[MarketDataTool()],
            llm=self.llm(),
            verbose=True,
        )

    @agent
    def news_analyst(self) -> Agent:
        return Agent(
            config=self.agents_config["news_analyst"],
            tools=[NewsScraperTool()],
            llm=self.llm(),
            verbose=True,
            memory=False,
            cache=False,
        )

    @agent
    def legendary_trader(self) -> Agent:
        return Agent(
            config=self.agents_config["legendary_trader"], llm=self.llm(), verbose=True
        )

    @task
    def fetch_data_task(self) -> Task:
        return Task(config=self.tasks_config["fetch_data_task"])

    @task
    def analyze_news_task(self) -> Task:
        return Task(config=self.tasks_config["analyze_news_task"])

    @task
    def strategy_task(self) -> Task:
        return Task(config=self.tasks_config["strategy_task"])

    @crew
    def crew(self) -> Crew:
        return Crew(
            agents=self.agents,
            tasks=self.tasks,
            process=Process.sequential,
            verbose=True,
        )
