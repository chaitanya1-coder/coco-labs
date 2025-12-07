# COCO LABS - VERIFY MIND , AI PREDICTION , SENTIMENTAL ANALYSIS

Verify-Mind AI is a cutting-edge decentralized application (dApp) that leverages **Trusted Execution Environments (TEEs)** and the **Flare Network** to enable verifiable, secure, and autonomous AI trading strategies.

## 🚀 Overview

The project integrates a secure smart contract vault with an AI agent running in a simulated TEE. Users can deposit funds into the vault, which authorizes the AI agent to execute trades based on pre-defined, verifiable strategies. The system ensures that trades are only executed if the AI model and data sources are attested and authentic.

## ✨ Key Features

*   **🛡️ Secure Smart Vault**: `VerifyMindVault` contract manages user deposits and enforces authorized execution.
*   **🤖 Verifiable AI Agent**: Python-based backend simulates a TEE, generating attestations for every strategy execution.
*   **📡 Real-Time Oracle Data**: Integrates **Flare Data Connector (FDC)** to fetch decentralized, tamper-proof price feeds for BTC, ETH, and BNB.
*   **📈 Prediction Dashboard**: Interactive UI visualizing real-time prices, historical trends (via CoinGecko), and AI-driven price predictions.
*   **🧩 Chrome Extension**: A dedicated browser extension to interact with the AI agent and receive trading signals.
*   **🔄 Automated Swaps**: Simulates DEX interactions (SparkDEX) for executing trade logic.

## 🏗️ Architecture

The project is structured as a monorepo with the following components:

*   **`frontend/`**: React application built with Vite and Tailwind CSS. Handles the UI for the Dashboard, Prediction Page, and Wallet connection.
*   **`backend/`**: Python FastAPI server. Acts as the TEE, handling strategy execution, FDC data fetching, and attestation generation.
*   **`smart-contracts/`**: Solidity contracts for the Vault and Mock FDC/DEX interfaces.
*   **`verify-mind-extension/`**: React-based Chrome Extension for user alerts and agent status.
*   **`flare-ai-kit/`**: SDK for building verifiable AI agents on Flare (integrated into backend).

## 🛠️ Setup & Installation

### Prerequisites
*   Node.js (v18+)
*   Python (v3.12+)
*   MetaMask Wallet (configured for Flare Coston2 Testnet)

### 1. Backend Setup
The backend runs the AI agent and TEE simulation.
```bash
cd backend
# Install dependencies
pip install -r requirements.txt
# Run the server
python server.py
```
*Server runs on `http://localhost:8000`*

### 2. Frontend Setup
The web interface for the dApp.
```bash
cd frontend
npm install
npm run dev
```
*App runs on `http://localhost:5173`*

### 3. Chrome Extension Setup
1.  Navigate to `verify-mind-extension` and build the project:
    ```bash
    cd verify-mind-extension
    npm install
    npm run build
    ```
2.  Open Chrome and go to `chrome://extensions`.
3.  Enable **Developer mode** (top right).
4.  Click **Load unpacked** and select the `verify-mind-extension/dist` folder.

### 4. Smart Contracts (Optional)
To deploy your own instances of the contracts:
```bash
cd smart-contracts
npm install
npx hardhat run scripts/deploy.js --network coston2
```

## ☁️ Deployment (Vercel)

This project is configured for seamless deployment on Vercel.
*   **Configuration**: `vercel.json` handles routing for both the Python backend (serverless) and React frontend.
*   **API Routing**: Frontend API calls are proxied to `/api/...` to support both local development and production deployment.

## 📜 License
MIT License
