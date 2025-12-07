import React, { useState, useEffect } from 'react';
import { TrendingUp, TrendingDown, RefreshCw } from 'lucide-react';

const CryptoCard = ({ name, symbol, price, change, isPositive }) => (
    <div className="bg-dark p-6 rounded-xl border border-gray-800 hover:border-gold transition duration-300">
        <div className="flex justify-between items-start mb-4">
            <div>
                <h3 className="text-gray-400 text-sm">{name}</h3>
                <p className="text-2xl font-bold">{symbol}</p>
            </div>
            <div className={`flex items-center ${isPositive ? 'text-green-500' : 'text-red-500'}`}>
                {isPositive ? <TrendingUp size={20} /> : <TrendingDown size={20} />}
                <span className="ml-1 text-sm font-semibold">{change}%</span>
            </div>
        </div>
        <p className="text-xl font-mono">$ {price}</p>
    </div>
);

const FEED_IDS = {
    BTC: "0x014254432f55534400000000000000000000000000",
    ETH: "0x014554482f55534400000000000000000000000000",
    USDT: "0x01555344542f555344000000000000000000000000",
    BNB: "0x01424e422f55534400000000000000000000000000",
    XRP: "0x015852502f55534400000000000000000000000000",
    SOL: "0x01534f4c2f55534400000000000000000000000000"
};

const Dashboard = () => {
    const [cryptos, setCryptos] = useState([
        { name: 'Bitcoin', symbol: 'BTC', price: 'Loading...', change: '0.00', isPositive: true, color: 'bg-orange-500', cap: '$ 1.6T' },
        { name: 'Ethereum', symbol: 'ETH', price: 'Loading...', change: '0.00', isPositive: true, color: 'bg-blue-500', cap: '$ 350B' },
        { name: 'XRP', symbol: 'XRP', price: 'Loading...', change: '0.00', isPositive: true, color: 'bg-gray-500', cap: '$ 32B' },
        { name: 'BNB', symbol: 'BNB', price: 'Loading...', change: '0.00', isPositive: true, color: 'bg-yellow-500', cap: '$ 87B' },
        { name: 'Solana', symbol: 'SOL', price: 'Loading...', change: '0.00', isPositive: true, color: 'bg-purple-500', cap: '$ 65B' },
    ]);
    const [loading, setLoading] = useState(false);

    const fetchPrices = async () => {
        setLoading(true);
        try {
            const response = await fetch('https://flr-data-availability.flare.network/api/v0/ftso/anchor-feeds-with-proof', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    feed_ids: Object.values(FEED_IDS)
                })
            });

            const data = await response.json();

            // Map response to state
            const newCryptos = cryptos.map(crypto => {
                const feedData = data.find(item => item.body.id === FEED_IDS[crypto.symbol]);
                if (feedData) {
                    const price = (feedData.body.value / Math.pow(10, feedData.body.decimals)).toFixed(2);
                    // Mocking change data since FTSO only provides current price
                    const mockChange = (Math.random() * 2 - 1).toFixed(2);
                    return {
                        ...crypto,
                        price: price,
                        change: mockChange,
                        isPositive: parseFloat(mockChange) >= 0
                    };
                }
                return crypto;
            });

            setCryptos(newCryptos);
        } catch (error) {
            console.error("Error fetching FTSO prices:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchPrices();
        const interval = setInterval(fetchPrices, 60000); // Refresh every minute
        return () => clearInterval(interval);
    }, []);

    return (
        <div className="container mx-auto p-6">
            <div className="text-center mb-12">
                <h1 className="text-5xl font-bold mb-4">Crypto Price Tracker</h1>
                <p className="text-gray-400">Powered by Flare Data Connector & FTSO</p>
                <button
                    onClick={fetchPrices}
                    disabled={loading}
                    className="mt-4 flex items-center justify-center mx-auto space-x-2 text-gold hover:text-yellow-400 transition"
                >
                    <RefreshCw size={16} className={loading ? "animate-spin" : ""} />
                    <span>Refresh Prices</span>
                </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
                {cryptos.slice(1).map((crypto) => (
                    <CryptoCard key={crypto.symbol} {...crypto} />
                ))}
            </div>

            <h2 className="text-3xl font-light text-center mb-8">Cryptocurrency Prices by Market Cap</h2>

            <div className="bg-dark rounded-xl border border-gray-800 overflow-hidden">
                <div className="bg-gold text-dark font-bold p-4 grid grid-cols-4 gap-4">
                    <div>Coin</div>
                    <div className="text-right">Price</div>
                    <div className="text-right">24h Change</div>
                    <div className="text-right">Market Cap</div>
                </div>
                {cryptos.map((crypto) => (
                    <div key={crypto.symbol} className="p-4 border-t border-gray-800 hover:bg-gray-900 transition">
                        <div className="grid grid-cols-4 gap-4 items-center">
                            <div className="flex items-center space-x-3">
                                <div className={`w-10 h-10 ${crypto.color} rounded-full flex items-center justify-center font-bold text-white`}>
                                    {crypto.symbol[0]}
                                </div>
                                <div>
                                    <p className="font-bold text-lg">{crypto.symbol}</p>
                                    <p className="text-gray-500 text-sm">{crypto.name}</p>
                                </div>
                            </div>
                            <div className="text-right font-mono">$ {crypto.price}</div>
                            <div className={`text-right ${crypto.isPositive ? 'text-green-500' : 'text-red-500'}`}>
                                {crypto.change}%
                            </div>
                            <div className="text-right text-gray-400">{crypto.cap}</div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default Dashboard;
