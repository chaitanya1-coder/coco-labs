import React, { useState } from 'react';
import { MessageSquare, X, Send } from 'lucide-react';

const Chatbot = ({ messages, onSendMessage, isOpen, setIsOpen }) => {
    const [input, setInput] = useState("");

    const handleSend = () => {
        if (!input.trim()) return;
        onSendMessage(input);
        setInput("");
    };

    return (
        <div className="fixed bottom-6 right-6 z-50">
            {!isOpen && (
                <button
                    onClick={() => setIsOpen(true)}
                    className="bg-gold hover:bg-yellow-500 text-dark p-4 rounded-full shadow-lg transition transform hover:scale-110"
                >
                    <MessageSquare size={24} />
                </button>
            )}

            {isOpen && (
                <div className="bg-dark border border-gray-700 rounded-2xl w-80 shadow-2xl overflow-hidden flex flex-col h-96">
                    <div className="bg-gold p-4 flex justify-between items-center text-dark font-bold">
                        <div className="flex items-center space-x-2">
                            <MessageSquare size={18} />
                            <span>VerifyMind AI</span>
                        </div>
                        <button onClick={() => setIsOpen(false)} className="hover:text-white transition">
                            <X size={18} />
                        </button>
                    </div>

                    <div className="flex-1 p-4 overflow-y-auto space-y-4 bg-darker">
                        {messages.map((msg, idx) => (
                            <div key={idx} className={`flex ${msg.isBot ? 'justify-start' : 'justify-end'}`}>
                                <div className={`max-w-[80%] p-3 rounded-xl text-sm break-words ${msg.isBot
                                    ? 'bg-gray-800 text-gray-200 rounded-tl-none'
                                    : 'bg-gold text-dark font-medium rounded-tr-none'
                                    }`}>
                                    {msg.text}
                                </div>
                            </div>
                        ))}
                    </div>

                    <div className="p-3 bg-dark border-t border-gray-700 flex space-x-2">
                        <input
                            type="text"
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            onKeyPress={(e) => e.key === 'Enter' && handleSend()}
                            placeholder="Type a message..."
                            className="flex-1 bg-gray-800 text-white px-3 py-2 rounded-lg focus:outline-none focus:ring-1 focus:ring-gold text-sm"
                        />
                        <button
                            onClick={handleSend}
                            className="bg-gold text-dark p-2 rounded-lg hover:bg-yellow-500 transition"
                        >
                            <Send size={18} />
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Chatbot;
