import React, { useState, useEffect } from 'react';
import { Wallet, ArrowDownCircle, Sparkles } from 'lucide-react';
import { ethers } from 'ethers';

const Navbar = ({ addMessage, openChat, onPredictClick, onHomeClick }) => {
    // ... state ...
    const [account, setAccount] = useState(null);
    const [balance, setBalance] = useState(null);
    const [vaultBalance, setVaultBalance] = useState(null);

    // Deployed VerifyMindVault on Coston2
    const VAULT_ADDRESS = "0x2531BB578B4AcB2FE478263c1C744d2F3200Cf68";

    // ... updateBalance ...
    const updateBalance = async (address) => {
        if (window.ethereum) {
            try {
                const provider = new ethers.BrowserProvider(window.ethereum);

                // User Wallet Balance
                if (address) {
                    const balanceBigInt = await provider.getBalance(address);
                    const balanceFormatted = ethers.formatEther(balanceBigInt);
                    setBalance(parseFloat(balanceFormatted).toFixed(4));
                }

                // Vault (Smart Account) Balance
                const vaultBalBigInt = await provider.getBalance(VAULT_ADDRESS);
                const vaultBalFormatted = ethers.formatEther(vaultBalBigInt);
                setVaultBalance(parseFloat(vaultBalFormatted).toFixed(4));

            } catch (error) {
                console.error("Error fetching balance:", error);
            }
        }
    };

    // ... connectWallet ...
    const connectWallet = async () => {
        if (window.ethereum) {
            try {
                // Explicitly request account access
                await window.ethereum.request({ method: 'eth_requestAccounts' });

                const provider = new ethers.BrowserProvider(window.ethereum);
                const signer = await provider.getSigner();
                const address = await signer.getAddress();

                console.log("Connected account:", address);
                setAccount(address);
                updateBalance(address);
            } catch (error) {
                console.error("Error connecting wallet:", error);
                alert("Failed to connect wallet. Check console for details.");
            }
        } else {
            alert("Please install MetaMask!");
        }
    };

    // ... useEffects ...
    useEffect(() => {
        if (account) {
            updateBalance(account); // Fetch immediately
            const interval = setInterval(() => updateBalance(account), 5000); // Refresh every 5s
            return () => clearInterval(interval);
        } else {
            // If account is null, still update vault balance
            updateBalance(null);
        }
    }, [account]);

    useEffect(() => {
        if (window.ethereum) {
            window.ethereum.on('accountsChanged', (accounts) => {
                if (accounts.length > 0) {
                    setAccount(accounts[0]);
                } else {
                    setAccount(null);
                    setBalance(null);
                }
            });
        }
    }, []);

    // ... handleDeposit ...
    const handleDeposit = async () => {
        if (!account) {
            alert("Please connect your wallet first!");
            return;
        }

        const amount = prompt("Enter amount of C2FLR to deposit:");
        if (!amount || isNaN(amount) || parseFloat(amount) <= 0) {
            return;
        }

        try {
            const provider = new ethers.BrowserProvider(window.ethereum);
            const signer = await provider.getSigner();

            const tx = await signer.sendTransaction({
                to: VAULT_ADDRESS,
                value: ethers.parseEther(amount)
            });

            alert(`Transaction sent! Hash: ${tx.hash}\nWaiting for confirmation...`);

            await tx.wait();

            alert("Deposit successful!");

            // Refresh balances
            updateBalance(account);

            // Open Chatbot
            openChat();

            // Trigger Chatbot Message
            const newVaultBalBigInt = await provider.getBalance(VAULT_ADDRESS);
            const newVaultBalFormatted = parseFloat(ethers.formatEther(newVaultBalBigInt)).toFixed(4);

            addMessage(`Thanks for Depositing !! You have ${newVaultBalFormatted} C2FLR Tokens in the flare smart account for trading. Please type "Yes" to confirm your trading strategy`, true);

            setTimeout(() => {
                addMessage("Reads BTC price from FTSO. If price < $95000, return BUY instruction and Attestation Quote.", true);
            }, 1000);

        } catch (error) {
            console.error("Deposit failed:", error);
            alert("Deposit failed! See console for details.");
        }
    };

    return (
        <nav className="bg-dark border-b border-gray-800 p-4">
            <div className="container mx-auto flex justify-between items-center">
                <div
                    className="text-gold text-2xl font-bold cursor-pointer hover:text-yellow-400 transition"
                    onClick={onHomeClick}
                >
                    COCO LABS
                </div>
                <div className="flex space-x-4">
                    {vaultBalance !== null && (
                        <div className="flex items-center space-x-2 bg-gray-800 text-white px-4 py-2 rounded-lg border border-gray-700">
                            <span className="text-gray-400 text-sm">Flare Smart Account:</span>
                            <span className="font-bold text-gold">{vaultBalance} C2FLR</span>
                        </div>
                    )}

                    <button
                        onClick={onPredictClick}
                        className="flex items-center space-x-2 bg-gray-800 hover:bg-gray-700 text-white px-4 py-2 rounded-lg transition border border-gray-700 hover:border-gold"
                    >
                        <Sparkles size={20} className="text-gold" />
                        <span>AI Prediction</span>
                    </button>

                    <button
                        onClick={handleDeposit}
                        className="flex items-center space-x-2 bg-gray-800 hover:bg-gray-700 text-white px-4 py-2 rounded-lg transition"
                    >
                        <ArrowDownCircle size={20} />
                        <span>Deposit</span>
                    </button>
                    <button
                        onClick={connectWallet}
                        className="flex items-center space-x-2 bg-gold hover:bg-yellow-500 text-dark font-bold px-4 py-2 rounded-lg transition"
                    >
                        <Wallet size={20} />
                        <span>
                            {account ? (
                                <div className="flex items-center space-x-2">
                                    <span>{balance} C2FLR</span>
                                    <span className="bg-black/20 px-2 py-0.5 rounded text-xs opacity-75">
                                        {account.slice(0, 6)}...{account.slice(-4)}
                                    </span>
                                </div>
                            ) : "Connect Wallet"}
                        </span>
                    </button>
                </div>
            </div>
        </nav>
    );
};

export default Navbar;
