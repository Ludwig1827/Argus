import { useState, useEffect, useRef } from 'react'
import axios from 'axios'
import ReactMarkdown from 'react-markdown'
import { createChart } from 'lightweight-charts'

// --- 1. FULL LIST OF 20 FUTURES ---
const FUTURES_LIST = [
    // Energy
    { ticker: "CL=F", name: "Crude Oil (WTI)", topics: "OPEC, Middle East Conflict, Global Demand, Inventory Data" },
    { ticker: "NG=F", name: "Natural Gas", topics: "Weather Forecasts, LNG Exports, Storage Reports" },
    { ticker: "RB=F", name: "RBOB Gasoline", topics: "Refinery Capacity, Driving Season Demand, Oil Prices" },
    { ticker: "HO=F", name: "Heating Oil", topics: "Winter Weather, Distillate Inventories, Diesel Demand" },
    
    // Metals
    { ticker: "GC=F", name: "Gold", topics: "US Dollar, Fed Interest Rates, Inflation, Safe Haven Flows" },
    { ticker: "SI=F", name: "Silver", topics: "Industrial Demand, Precious Metals Sentiment, USD Strength" },
    { ticker: "HG=F", name: "Copper", topics: "China Manufacturing, Construction Demand, Global Growth" },
    { ticker: "PL=F", name: "Platinum", topics: "Auto Catalyst Demand, South Africa Mining, Green Energy" },
    
    // Indices
    { ticker: "ES=F", name: "S&P 500 E-Mini", topics: "US GDP, Corporate Earnings, Fed Policy, Jobs Report" },
    { ticker: "NQ=F", name: "Nasdaq 100 E-Mini", topics: "Tech Sector Earnings, AI Trends, Interest Rates" },
    { ticker: "YM=F", name: "Dow Jones E-Mini", topics: "Industrial Sector, Blue Chip Earnings, Economic Data" },
    { ticker: "RTY=F", name: "Russell 2000", topics: "Small Cap Performance, Regional Banks, US Domestic Growth" },
    
    // Bonds
    { ticker: "ZB=F", name: "30-Year Treasury Bond", topics: "Long Term Yields, Debt Ceiling, Economic Outlook" },
    { ticker: "ZN=F", name: "10-Year Treasury Note", topics: "Bond Yields, Fed Dot Plot, Inflation Data (CPI/PPI)" },
    
    // Grains
    { ticker: "ZC=F", name: "Corn", topics: "USDA Reports, Midwest Weather, Brazil Harvest, Ethanol" },
    { ticker: "ZS=F", name: "Soybeans", topics: "China Export Demand, South America Weather, Crush Spread" },
    { ticker: "ZW=F", name: "Wheat", topics: "Ukraine/Russia Grain Deal, Drought Conditions, Global Supply" },
    
    // Softs
    { ticker: "KC=F", name: "Coffee", topics: "Brazil Frost, Vietnam Exports, Arabica Supply" },
    { ticker: "SB=F", name: "Sugar", topics: "India Export Ban, Brazil Ethanol Production, Weather" },
    { ticker: "CC=F", name: "Cocoa", topics: "West Africa Disease, Ivory Coast Harvest, Chocolate Demand" }
];

function App() {
  const [selectedAsset, setSelectedAsset] = useState(FUTURES_LIST[0]);
  const [ticker, setTicker] = useState(FUTURES_LIST[0].ticker)
  const [asset, setAsset] = useState(FUTURES_LIST[0].name)
  const [topics, setTopics] = useState(FUTURES_LIST[0].topics)
  
  const [report, setReport] = useState("")
  const [news, setNews] = useState([])
  const [loading, setLoading] = useState(false)
  const [chartData, setChartData] = useState([])
  
  const chartContainerRef = useRef();
  const chartRef = useRef();

  // --- Handle Dropdown ---
  const handleSelection = (e) => {
      const selectedTicker = e.target.value;
      const item = FUTURES_LIST.find(f => f.ticker === selectedTicker);
      if (item) {
          setSelectedAsset(item);
          setTicker(item.ticker);
          setAsset(item.name);
          setTopics(item.topics);
      }
  };

  // --- Chart Effect (Fixed) ---
  useEffect(() => {
    if (!chartContainerRef.current || chartData.length === 0) return;

    // NOTE: Removed manual check here to avoid "Object is disposed" error.
    // React cleanup function handles removal safely.

    const chart = createChart(chartContainerRef.current, {
        width: chartContainerRef.current.clientWidth,
        height: 450,
        layout: { background: { type: 'solid', color: '#111827' }, textColor: '#9ca3af' },
        grid: { vertLines: { color: '#1f2937'}, horzLines: { color: '#1f2937' } },
        timeScale: { borderColor: '#374151' },
        rightPriceScale: { borderColor: '#374151' },
    });

    const candlestickSeries = chart.addCandlestickSeries({
        upColor: '#10b981', downColor: '#ef4444', borderVisible: false, wickUpColor: '#10b981', wickDownColor: '#ef4444',
    });
    
    candlestickSeries.setData(chartData);
    chart.timeScale().fitContent();
    
    // Store chart instance in ref
    chartRef.current = chart;

    const handleResize = () => {
        if (chartContainerRef.current) {
            chart.applyOptions({ width: chartContainerRef.current.clientWidth });
        }
    };

    window.addEventListener('resize', handleResize);

    // Cleanup function
    return () => { 
        window.removeEventListener('resize', handleResize); 
        chart.remove(); 
        chartRef.current = null; // Clear ref
    };
  }, [chartData]);

  // --- Run Analysis ---
  const handleRun = async () => {
    setLoading(true)
    setReport("") 
    setNews([])
    
    // Fetch data in parallel
    axios.get(`http://localhost:8000/market-data/${ticker}`).then(res => setChartData(res.data)).catch(console.error);
    axios.post("http://localhost:8000/news", { ticker, asset, topics }).then(res => setNews(res.data.articles)).catch(console.error);

    try {
      const res = await axios.post("http://localhost:8000/analyze", { ticker, asset, topics })
      setReport(res.data.report)
    } catch (error) {
      setReport("**Error:** Failed to contact Argus Agent.")
    }
    setLoading(false)
  }

  const getSentimentColor = (s) => {
      if (s === 'Bullish') return 'bg-green-900/30 text-green-400 border-green-800/50';
      if (s === 'Bearish') return 'bg-red-900/30 text-red-400 border-red-800/50';
      return 'bg-gray-800/50 text-gray-400 border-gray-700/50';
  }

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-gray-100 font-sans p-4 md:p-8 lg:p-12">
      <div className="max-w-7xl mx-auto">
        
        {/* Header */}
        <div className="flex justify-between items-end mb-8 border-b border-gray-800 pb-4">
            <div>
                <h1 className="text-4xl font-black tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-blue-500 via-blue-400 to-teal-400">
                ARGUS
                </h1>
                <p className="text-sm text-gray-500 font-mono uppercase tracking-widest mt-1">Institutional Futures Terminal</p>
            </div>
            <div className={`text-sm font-mono py-1 px-3 rounded-full border ${loading ? 'bg-yellow-900/20 text-yellow-500 border-yellow-700/50 animate-pulse' : 'bg-green-900/20 text-green-500 border-green-700/50'}`}>
                {loading ? "● PROCESSING DATA STREAM..." : "● MARKET READY"}
            </div>
        </div>

        {/* Controls */}
        <div className="bg-[#111827] p-5 rounded-xl border border-gray-800 shadow-2xl mb-8 grid grid-cols-1 md:grid-cols-12 gap-4">
          <div className="md:col-span-3">
            <label className="text-gray-500 text-[10px] uppercase font-bold mb-2 block tracking-wider">Select Market (20 Choices)</label>
            <select 
                className="w-full bg-gray-900/50 p-3 rounded-lg border border-gray-700 focus:border-blue-500 outline-none text-white font-medium cursor-pointer hover:border-gray-600 transition"
                value={selectedAsset.ticker} onChange={handleSelection}>
                {FUTURES_LIST.map(f => <option key={f.ticker} value={f.ticker}> {f.name} ({f.ticker}) </option>)}
            </select>
          </div>
          <div className="md:col-span-7">
            <label className="text-gray-500 text-[10px] uppercase font-bold mb-2 block tracking-wider">Fundamental Focus Topics</label>
            <input className="w-full bg-gray-900/50 p-3 rounded-lg border border-gray-700 text-gray-300 font-mono text-sm focus:border-blue-500 outline-none" 
                   value={topics} onChange={e => setTopics(e.target.value)} />
          </div>
          <div className="md:col-span-2 flex items-end">
            <button onClick={handleRun} disabled={loading} 
                    className={`w-full h-[46px] rounded-lg font-bold text-sm uppercase tracking-wider transition-all ${loading ? 'bg-gray-700 text-gray-400 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-500 text-white shadow-lg shadow-blue-900/30 hover:shadow-blue-700/50'}`}>
                {loading ? "Analyzing..." : "Execute Analysis"}
            </button>
          </div>
        </div>

        {/* --- LIVERMORE VERDICT (ALWAYS VISIBLE) --- */}
        <div className="animate-fade-in mb-8">
            <div className={`bg-[#121212] rounded-xl border-2 shadow-2xl overflow-hidden relative transition-all duration-500 ${report ? 'border-amber-900/50' : 'border-gray-800 opacity-75'}`}>
                {/* Vintage texture overlay */}
                <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/aged-paper.png')] opacity-10 mix-blend-overlay pointer-events-none"></div>
                
                {/* Vintage Header */}
                <div className={`px-6 py-4 border-b flex items-center gap-4 transition-colors ${report ? 'bg-gradient-to-r from-amber-950 to-[#1a1510] border-amber-900/80' : 'bg-gray-900 border-gray-800'}`}>
                    <div className={`p-2 rounded border ${report ? 'bg-amber-900/40 border-amber-700/50' : 'bg-gray-800 border-gray-700'}`}>
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={`w-6 h-6 ${report ? 'text-amber-500' : 'text-gray-500'}`}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.042A8.967 8.967 0 0 0 6 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 0 1 6 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 0 1 6-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0 0 18 18a8.967 8.967 0 0 0-6 2.292m0-14.25v14.25" />
                        </svg>
                    </div>
                    <div>
                        <h2 className={`font-serif text-2xl font-bold uppercase tracking-widest ${report ? 'text-amber-500' : 'text-gray-500'}`}>Boy Plunger's Verdict</h2>
                        <p className={`text-xs font-serif italic ${report ? 'text-amber-700/80' : 'text-gray-600'}`}>"The line of least resistance..."</p>
                    </div>
                </div>

                {/* Content */}
                <div className="p-8 md:p-10 relative z-10 min-h-[200px]">
                    {report ? (
                        <>
                            <div className="prose prose-lg prose-invert max-w-none font-serif
                                            prose-headings:text-amber-500 prose-headings:font-bold prose-headings:uppercase prose-headings:tracking-wider
                                            prose-p:text-amber-100/90 prose-p:leading-relaxed
                                            prose-strong:text-amber-400 prose-strong:font-black
                                            prose-li:marker:text-amber-700 prose-li:text-amber-100/90
                                            prose-hr:border-amber-900/50">
                                <ReactMarkdown>{report}</ReactMarkdown>
                            </div>
                            <div className="mt-10 pt-6 border-t border-amber-900/30 flex justify-end">
                                <div className="text-right">
                                    <p className="font-serif text-2xl text-amber-500/60 font-bold italic" style={{fontFamily: '"Playfair Display", serif'}}>Jesse L. Livermore</p>
                                    <p className="text-amber-700/60 text-xs uppercase tracking-widest mt-1">Boy Plunger | 1929</p>
                                </div>
                            </div>
                        </>
                    ) : (
                        <div className="h-full flex flex-col items-center justify-center text-gray-700 space-y-4 py-10">
                            <span className="font-serif text-4xl italic opacity-20">"Waiting for the tape..."</span>
                            <p className="text-sm uppercase tracking-widest opacity-40">Select a market above and click Execute Analysis to begin</p>
                        </div>
                    )}
                </div>
            </div>
        </div>

        {/* --- SUPPORTING DATA GRID (Bottom) --- */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
            
            {/* LEFT: Chart */}
            <div className="lg:col-span-2">
                <div className="bg-[#111827] rounded-xl border border-gray-800 p-1 shadow-2xl overflow-hidden">
                    <div className="bg-[#111827] px-4 py-2 border-b border-gray-800 flex justify-between items-center">
                        <h2 className="font-bold text-gray-300 text-sm">PRICE ACTION: <span className="text-blue-400">{ticker}</span></h2>
                    </div>
                    <div ref={chartContainerRef} className="w-full h-[450px] relative bg-[#111827]">
                         {chartData.length === 0 && (
                             <div className="absolute inset-0 flex flex-col items-center justify-center text-gray-600 space-y-2">
                                 <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-10 h-10 opacity-50">
                                  <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 3v11.25A2.25 2.25 0 0 0 6 16.5h2.25M3.75 21h16.5A2.25 2.25 0 0 0 22.5 18.75V7.5a2.25 2.25 0 0 0-2.25-2.25h-10.5" />
                                </svg>
                                 <span className="text-sm font-medium">Awaiting Market Data...</span>
                             </div>
                         )}
                    </div>
                </div>
            </div>

            {/* RIGHT: News Wire */}
            <div className="lg:col-span-1">
                <div className="bg-[#111827] rounded-xl border border-gray-800 h-[500px] flex flex-col shadow-2xl overflow-hidden">
                    <div className="bg-[#1f2937]/50 px-4 py-3 border-b border-gray-800 flex items-center gap-2">
                        <span className="relative flex h-2 w-2">
                          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
                          <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-500"></span>
                        </span>
                        <h2 className="text-xs font-bold text-gray-300 uppercase tracking-widest">Live Fundamental Wire</h2>
                    </div>
                    
                    <div className="overflow-y-auto p-3 space-y-3 flex-grow scrollbar-thin scrollbar-thumb-gray-700 scrollbar-track-transparent">
                        {news.map((item, idx) => (
                            <a key={idx} href={item.link} target="_blank" rel="noopener noreferrer" 
                               className="block p-4 bg-[#1a1a1a] rounded-lg border border-gray-800/80 hover:border-blue-500/50 hover:bg-[#222] transition group relative">
                                <div className="flex justify-between items-start mb-3">
                                    <span className={`text-[9px] uppercase font-black px-2 py-0.5 rounded border ${getSentimentColor(item.sentiment)}`}>
                                        {item.sentiment}
                                    </span>
                                    <span className="text-[10px] text-gray-500 font-mono">{item.date || "Recent"}</span>
                                </div>
                                <p className="text-sm text-gray-300 leading-relaxed font-medium group-hover:text-blue-300 transition-colors line-clamp-3">
                                    {item.summary}
                                </p>
                                <div className="mt-3 flex items-center gap-2 justify-end">
                                    <span className="text-[9px] text-gray-600 uppercase tracking-wider font-bold">
                                        — {item.source}
                                    </span>
                                </div>
                            </a>
                        ))}
                        {!news.length && !loading && (
                            <div className="h-full flex flex-col items-center justify-center text-gray-600 space-y-2 opacity-75">
                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-8 h-8">
                                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 7.5h1.5m-1.5 3h1.5m-7.5 3h7.5m-7.5 3h7.5m3-9h3.375c.621 0 1.125.504 1.125 1.125V18a2.25 2.25 0 0 1-2.25 2.25M16.5 7.5V18a2.25 2.25 0 0 0 2.25 2.25M16.5 7.5V4.875c0-.621-.504-1.125-1.125-1.125H4.125C3.504 3.75 3 4.254 3 4.875V18a2.25 2.25 0 0 0 2.25 2.25h13.5M6 7.5h3v3H6v-3Z" />
                                </svg>
                                <span className="text-xs font-medium uppercase tracking-wider">Awaiting Signal...</span>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
      </div>
    </div>
  )
}

export default App