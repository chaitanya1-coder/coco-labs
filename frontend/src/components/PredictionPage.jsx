import React, { useState, useEffect } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Bitcoin } from 'lucide-react';

const CoinSection = ({ coin }) => {
    const [chartData, setChartData] = useState([]);
    const [currentPrice, setCurrentPrice] = useState(null);
    const [loading, setLoading] = useState(true);
    const [showPrediction, setShowPrediction] = useState(false);

    const [coinDetails, setCoinDetails] = useState(null);

    // Fetch Historical Data from CoinGecko
    useEffect(() => {
        const fetchChartData = async () => {
            setLoading(true);
            try {
                const response = await fetch(`https://api.coingecko.com/api/v3/coins/${coin.id}/market_chart?vs_currency=usd&days=1`);
                const data = await response.json();

                if (data.prices) {
                    const formattedData = data.prices.map(item => {
                        const date = new Date(item[0]);
                        const timeStr = date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
                        return {
                            time: timeStr,
                            price: item[1]
                        };
                    });
                    setChartData(formattedData);
                }
            } catch (error) {
                console.error(`Error fetching ${coin.name} chart data:`, error);
            } finally {
                setLoading(false);
            }
        };

        fetchChartData();
    }, [coin.id]);

    // Fetch Coin Details (Rank, Sentiment)
    useEffect(() => {
        const fetchCoinDetails = async () => {
            try {
                const response = await fetch(`https://api.coingecko.com/api/v3/coins/${coin.id}?localization=false&tickers=false&market_data=true&community_data=false&developer_data=false&sparkline=false`);
                const data = await response.json();
                setCoinDetails(data);
            } catch (error) {
                console.error(`Error fetching ${coin.name} details:`, error);
            }
        };

        fetchCoinDetails();
    }, [coin.id]);

    // Fetch Real-Time Price from FDC (Backend)
    useEffect(() => {
        const fetchPrice = async () => {
            try {
                const response = await fetch(`http://localhost:8000/price/${coin.symbol}`);
                const result = await response.json();

                if (result.price > 0) {
                    setCurrentPrice(result.price);
                }
            } catch (error) {
                console.error(`Error fetching ${coin.name} price:`, error);
            }
        };

        fetchPrice();
        const interval = setInterval(fetchPrice, 5000);
        return () => clearInterval(interval);
    }, [coin.symbol]);

    // Prepare data for chart
    const displayData = showPrediction
        ? chartData.map(item => ({ ...item, price: item.price * 1.01 }))
        : chartData;

    return (
        <div className="flex flex-col lg:flex-row gap-8 text-white border-b border-gray-800 pb-12 mb-12 last:border-0">
            {/* Left Column: Info */}
            <div className="lg:w-1/3 flex flex-col space-y-6">
                <div className="flex items-center space-x-4">
                    <div className="p-4 rounded-full" style={{ backgroundColor: coin.color }}>
                        {coin.id === 'bitcoin' && <Bitcoin size={64} className="text-white" />}
                        {coin.id === 'ethereum' && (
                            <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-white">
                                <path d="M12 2L2 12l10 10 10-10L12 2z" />
                                <path d="M2 12l10 5 10-5" />
                                <path d="M12 22V12" />
                            </svg>
                        )}
                        {coin.id === 'binancecoin' && (
                            <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-white">
                                <path d="M12 2L2 12l10 10 10-10L12 2z" />
                                <path d="M12 2v20" />
                                <path d="M2 12h20" />
                            </svg>
                        )}
                    </div>
                </div>

                <h1 className="text-5xl font-bold">{coin.name}</h1>

                <p className="text-gray-400 text-lg leading-relaxed">
                    {coin.name} is a leading cryptocurrency in the decentralized market.
                </p>

                <div className="space-y-4 pt-4">
                    <div className="flex items-center space-x-2">
                        <span className="text-2xl font-bold">Rank:</span>
                        <span className="text-2xl">
                            {coinDetails ? `#${coinDetails.market_cap_rank}` : "Loading..."}
                        </span>
                    </div>

                    <div className="flex items-center space-x-2">
                        <span className="text-2xl font-bold">Current Price:</span>
                        <span className="text-2xl">
                            {currentPrice ? `$ ${currentPrice.toLocaleString()}` : "Loading..."}
                        </span>
                    </div>

                    <div className="flex space-x-4 pt-2">
                        <button className="bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-4 rounded transition">
                            Bullish: {coinDetails ? `${coinDetails.sentiment_votes_up_percentage}%` : "..."}
                        </button>
                        <button className="bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-4 rounded transition">
                            Bearish: {coinDetails ? `${coinDetails.sentiment_votes_down_percentage}%` : "..."}
                        </button>
                    </div>
                </div>
            </div>

            {/* Right Column: Chart */}
            <div className="lg:w-2/3 flex flex-col space-y-4">
                <div className="h-[400px] w-full bg-darker/50 rounded-lg p-4">
                    {loading ? (
                        <div className="h-full w-full flex items-center justify-center text-gray-400">
                            Loading Chart Data...
                        </div>
                    ) : (
                        <ResponsiveContainer width="100%" height="100%">
                            <LineChart data={displayData}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#333" vertical={false} />
                                <XAxis
                                    dataKey="time"
                                    stroke="#666"
                                    tick={{ fill: '#666', fontSize: 10 }}
                                    interval={24}
                                    angle={-45}
                                    textAnchor="end"
                                    height={60}
                                />
                                <YAxis
                                    domain={['auto', 'auto']}
                                    stroke="#666"
                                    tick={{ fill: '#666', fontSize: 12 }}
                                    tickFormatter={(value) => `$${value.toLocaleString()}`}
                                />
                                <Tooltip
                                    contentStyle={{ backgroundColor: '#1a1a1a', border: '1px solid #333' }}
                                    itemStyle={{ color: coin.color }}
                                    formatter={(value) => [`$ ${value.toLocaleString()}`, 'Price']}
                                />
                                <Line
                                    type="monotone"
                                    dataKey="price"
                                    stroke={coin.color}
                                    strokeWidth={2}
                                    dot={false}
                                    strokeDasharray={showPrediction ? "5 5" : "0"}
                                    activeDot={{ r: 6, fill: coin.color }}
                                />
                            </LineChart>
                        </ResponsiveContainer>
                    )}
                </div>

                {/* Prediction Toggle Button */}
                <div className="flex justify-center pt-4">
                    <button
                        onClick={() => setShowPrediction(!showPrediction)}
                        className={`py-3 px-6 rounded border transition font-bold ${showPrediction
                            ? 'bg-gold text-dark border-gold'
                            : 'bg-transparent text-gray-400 border-gray-600 hover:border-gold hover:text-gold'
                            }`}
                    >
                        24 Hours
                    </button>
                </div>
            </div>
        </div>
    );
};

const PredictionPage = () => {
    const coins = [
        { id: 'bitcoin', symbol: 'btc', name: 'Bitcoin', color: '#F7931A' },
        { id: 'ethereum', symbol: 'eth', name: 'Ethereum', color: '#627EEA' },
        { id: 'binancecoin', symbol: 'bnb', name: 'BNB', color: '#F3BA2F' }
    ];

    return (
        <div className="container mx-auto p-8">
            {coins.map(coin => (
                <CoinSection key={coin.id} coin={coin} />
            ))}
        </div>
    );
};

export default PredictionPage;
