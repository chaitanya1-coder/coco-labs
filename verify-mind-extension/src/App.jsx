import React, { useState, useEffect, useRef } from 'react';
import { Send, Bot, User, ShieldCheck, AlertCircle, Loader } from 'lucide-react';
import { ethers } from 'ethers';

const VAULT_ADDRESS = "0x2531BB578B4AcB2FE478263c1C744d2F3200Cf68";

function App() {
    const [messages, setMessages] = useState([
        { text: "Welcome to Verify-Mind AI! Connect your Trading AI Agent to start.", isBot: true }
    ]);
    const [input, setInput] = useState("");
    const [isProcessing, setIsProcessing] = useState(false);
    const [walletAddress, setWalletAddress] = useState(null);
    const messagesEndRef = useRef(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(scrollToBottom, [messages]);

    const connectWallet = async () => {
        if (typeof window.ethereum !== 'undefined') {
            try {
                // Request account access explicitly first
                await window.ethereum.request({ method: 'eth_requestAccounts' });

                const provider = new ethers.BrowserProvider(window.ethereum);
                const signer = await provider.getSigner();
                const address = await signer.getAddress();
                setWalletAddress(address);
                addMessage("AI Agent Connected! Type 'Yes' to execute the trading strategy.", true);
            } catch (error) {
                console.error("Connection error:", error);
                addMessage("AI Agent Connection Failed. Please check your AI Agent.", true);
            }
        } else {
            addMessage("AI Agent Connection Failed: AI Agent not detected.", true);
        }
    };

    const addMessage = (text, isBot = false) => {
        setMessages(prev => [...prev, { text, isBot }]);
    };

    const handleSend = async () => {
        if (!input.trim()) return;
        const userMsg = input;
        setInput("");
        addMessage(userMsg, false);

        if (userMsg.toLowerCase() === "yes") {
            await executeStrategy();
        } else {
            setTimeout(() => {
                addMessage("I am Verify-Mind AI Agent. We are in a Trusted Execution Environment. Do you confirm this trading strategy? Reads BTC price from FTSO. If price < $95000, return BUY instruction and Attestation Quote.", true);
            }, 500);
        }
    };

    const executeStrategy = async () => {
        setIsProcessing(true);
        addMessage("Verifying Transaction and Attestation On-chain...", true);

        try {
            // 1. Call Backend (TEE Simulation)
            const response = await fetch("http://localhost:8000/execute-strategy", {
                method: "POST"
            });
            const data = await response.json();

            addMessage(data.message, true); // "Trigger Detected..."

            // 2. On-Chain Verification
            if (window.ethereum) {
                const provider = new ethers.BrowserProvider(window.ethereum);
                const signer = await provider.getSigner();

                const abi = ["function executeStrategy(bytes memory tradeData, bytes memory attestation) external"];
                const contract = new ethers.Contract(VAULT_ADDRESS, abi, signer);

                // Trade Data Construction (Same as main app)
                const coder = ethers.AbiCoder.defaultAbiCoder();
                const amountIn = ethers.parseEther("1");
                const amountOutMin = 0;
                const WNAT_ADDRESS = "0xC67DCE33D7A8efA5FfEB961899C73fe01bCe9273";
                const WBTC_ADDRESS = "0x1234567890123456789012345678901234567890";
                const path = [WNAT_ADDRESS, WBTC_ADDRESS];
                const to = await signer.getAddress();
                const deadline = Math.floor(Date.now() / 1000) + 60 * 20;

                const tradeData = coder.encode(
                    ["uint256", "uint256", "address[]", "address", "uint256"],
                    [amountIn, amountOutMin, path, to, deadline]
                );

                // Hex encode signature
                const signatureBytes = ethers.hexlify(ethers.toUtf8Bytes(data.signature));

                const tx = await contract.executeStrategy(tradeData, signatureBytes);
                addMessage(`Transaction sent: ${tx.hash}`, true);

                await tx.wait();
                addMessage("Verification Successful! FDC confirmed TEE signature.", true);
            }
        } catch (error) {
            console.error(error);
            addMessage(`Error: ${error.message}`, true);
        } finally {
            setIsProcessing(false);
        }
    };

    return (
        <div className="flex flex-col h-screen bg-darker text-white rounded-3xl overflow-hidden border border-gray-700">
            {/* Header */}
            <div className="bg-dark p-4 border-b border-gray-800 flex justify-between items-center">
                <div className="font-bold text-gold">Verify-Mind AI</div>
                <div className="flex items-center space-x-2">
                    {!walletAddress ? (
                        <button onClick={connectWallet} className="bg-gold text-dark px-3 py-1 rounded text-sm font-bold whitespace-nowrap">
                            Connect Your AI Agent
                        </button>
                    ) : (
                        <div className="text-xs text-green-500 flex items-center bg-gray-800 px-2 py-1 rounded border border-gray-700">
                            <ShieldCheck size={12} className="mr-1" />
                            {walletAddress.slice(0, 6)}...{walletAddress.slice(-4)}
                        </div>
                    )}
                </div>
            </div>

            {/* Chat Area */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {messages.map((msg, idx) => (
                    <div key={idx} className={`flex ${msg.isBot ? 'justify-start' : 'justify-end'}`}>
                        <div className={`max-w-[85%] p-3 rounded-lg text-sm break-words ${msg.isBot ? 'bg-gray-800 text-gray-200' : 'bg-gold text-dark font-medium'
                            }`}>
                            {msg.text}
                        </div>
                    </div>
                ))}
                {isProcessing && (
                    <div className="flex justify-start">
                        <div className="bg-gray-800 p-3 rounded-lg flex items-center space-x-2">
                            <Loader size={16} className="animate-spin text-gold" />
                            <span className="text-gray-400 text-xs">Processing...</span>
                        </div>
                    </div>
                )}
                <div ref={messagesEndRef} />
            </div>

            {/* Input Area */}
            <div className="p-4 bg-dark border-t border-gray-800">
                <div className="flex items-center bg-gray-900 rounded-lg px-4 py-2 border border-gray-700 focus-within:border-gold transition">
                    <input
                        type="text"
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        onKeyPress={(e) => e.key === 'Enter' && handleSend()}
                        placeholder="Type a message..."
                        className="bg-transparent flex-1 outline-none text-white placeholder-gray-500"
                        disabled={isProcessing}
                    />
                    <button onClick={handleSend} disabled={isProcessing} className="text-gold hover:text-white transition ml-2">
                        <Send size={20} />
                    </button>
                </div>
            </div>
        </div>
    );
}

export default App;
