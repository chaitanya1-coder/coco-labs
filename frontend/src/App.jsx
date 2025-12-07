import React, { useState } from 'react';
import Navbar from './components/Navbar';
import Dashboard from './components/Dashboard';
import Chatbot from './components/Chatbot';
import { ethers } from 'ethers';
import PredictionPage from './components/PredictionPage';

function App() {
  const [messages, setMessages] = useState([
    { text: "Hello! I'm your VerifyMind AI Agent. How can I help you today?", isBot: true }
  ]);

  const [strategyConfirmed, setStrategyConfirmed] = useState(false);
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [currentView, setCurrentView] = useState('dashboard');

  const addMessage = (text, isBot = false) => {
    setMessages(prev => [...prev, { text, isBot }]);
  };

  const openChat = () => setIsChatOpen(true);

  const handleUserMessage = async (text) => {
    addMessage(text, false);

    if (text.toLowerCase() === "yes") {
      setStrategyConfirmed(true);
      addMessage("Verifying TEE Signature on-chain...", true);

      // Call Backend API
      try {
        const response = await fetch('http://localhost:8000/execute-strategy', {
          method: 'POST'
        });
        const data = await response.json();

        // On-Chain Verification
        if (window.ethereum) {
          const provider = new ethers.BrowserProvider(window.ethereum);
          const signer = await provider.getSigner();

          // Deployed VerifyMindVault Address
          const VAULT_ADDRESS = "0x2531BB578B4AcB2FE478263c1C744d2F3200Cf68";

          const abi = [
            "function executeStrategy(bytes memory tradeData, bytes memory attestation) external"
          ];

          const contract = new ethers.Contract(VAULT_ADDRESS, abi, signer);

          // Trade Data for SparkDEX Router (swapExactETHForTokens)
          // (uint256 amountIn, uint256 amountOutMin, address[] memory path, address to, uint256 deadline)
          const coder = ethers.AbiCoder.defaultAbiCoder();
          const amountIn = ethers.parseEther("1");
          const amountOutMin = 0;
          const WNAT_ADDRESS = "0xC67DCE33D7A8efA5FfEB961899C73fe01bCe9273"; // Coston2 WNat
          const WBTC_ADDRESS = "0x1234567890123456789012345678901234567890"; // Dummy WBTC
          const path = [WNAT_ADDRESS, WBTC_ADDRESS];
          const to = await signer.getAddress(); // Send swapped tokens to user
          const deadline = Math.floor(Date.now() / 1000) + 60 * 20; // 20 mins

          const tradeData = coder.encode(
            ["uint256", "uint256", "address[]", "address", "uint256"],
            [amountIn, amountOutMin, path, to, deadline]
          );

          try {
            console.log("Received Signature (JWT):", data.signature);

            // Convert JWT string to Hex for Solidity 'bytes'
            const signatureHex = ethers.hexlify(ethers.toUtf8Bytes(data.signature));
            console.log("Encoded Signature (Hex):", signatureHex);

            const tx = await contract.executeStrategy(tradeData, signatureHex);
            addMessage(`Transaction sent: ${tx.hash}. Waiting for FDC verification...`, true);

            await tx.wait();

            addMessage("Verification Successful! FDC confirmed TEE signature.", true);
            setTimeout(() => {
              addMessage(data.message, true);
            }, 1000);

          } catch (txError) {
            console.error("On-chain verification failed:", txError);
            // Extract reason if possible
            const reason = txError.reason || txError.message || "Unknown error";
            addMessage(`On-chain verification failed! ${reason}`, true);
          }
        } else {
          addMessage("Wallet not connected. Cannot verify on-chain.", true);
        }

      } catch (error) {
        console.error("Error executing strategy:", error);
        addMessage("Error executing strategy. Check console.", true);
      }

    } else {
      // Generate random number between 100 and 1000
      const randomPrice = Math.floor(Math.random() * (1000 - 100 + 1)) + 100;

      setTimeout(() => {
        addMessage(`Reads BTC price from FTSO. If price < $${randomPrice}, return BUY instruction and Attestation Quote.`, true);
      }, 1000);
    }
  };

  return (
    <div className="min-h-screen bg-darker text-white font-sans">
      <Navbar
        addMessage={addMessage}
        openChat={openChat}
        onPredictClick={() => setCurrentView('prediction')}
        onHomeClick={() => setCurrentView('dashboard')}
      />
      <main>
        {currentView === 'dashboard' ? <Dashboard /> : <PredictionPage />}
      </main>
      <Chatbot
        messages={messages}
        onSendMessage={handleUserMessage}
        isOpen={isChatOpen}
        setIsOpen={setIsChatOpen}
      />
    </div>
  );
}


export default App;
