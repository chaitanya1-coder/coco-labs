# Verify-Mind Architecture & TEE Verification Analysis

## 1. System Overview
Verify-Mind is a decentralized trading agent that leverages **Trusted Execution Environments (TEEs)** and the **Flare Network** to execute verifiable, trustless trading strategies.

### Core Components
1.  **AI Agent (TEE)**: A Python-based agent running inside a secure enclave (simulated). It monitors market data and generates trade instructions.
2.  **Flare Data Connector (FDC)**: A decentralized oracle system that provides trusted price feeds (BTC/USD, FLR/USD) to the TEE and the Smart Contract.
3.  **Smart Contract (`VerifyMindVault`)**: The on-chain enforcer. It holds funds and only executes trades if they are accompanied by a valid "Proof of Inference" (Attestation) from the TEE.
4.  **SparkDEX**: The decentralized exchange where the actual token swaps occur.

## 2. The Verification Mechanism
The core innovation is the **"Proof of Inference"** flow:

### Step 1: Data Ingestion (Trusted)
The AI Agent fetches prices from the **FDC**. This ensures the input data is tamper-proof and consistent with the blockchain's view of reality.
- *Code*: `server.py` calls FDC API.

### Step 2: Decision & Attestation (Secure)
The Agent processes the data and decides to trade (e.g., "BUY WBTC").
Crucially, it signs this instruction using a **Hardware-based Key** (TPM) that only exists inside the TEE.
- *Artifact*: A **JWT (JSON Web Token)** containing the instruction ("nonce") and signed by the TEE's private key.
- *Simulation*: `VtpmAttestation` generates a mock JWT.

### Step 3: On-Chain Verification (Trustless)
The User submits the transaction to `VerifyMindVault.executeStrategy(tradeData, attestation)`.
The Smart Contract:
1.  **Verifies the Attestation**: Calls `FdcVerification.verify(attestation)`.
    - Checks the signature against the known TEE public keys.
    - **CRITICAL**: Checks the `measurement` (Code Hash). This ensures the *exact approved code* generated the instruction. If the AI code was tampered with, the hash would change, and the contract would reject it.
2.  **Executes the Trade**: If verified, it calls `SparkDEX` to swap funds.

## 3. Chrome Extension Architecture
To bring this to a browser extension:
- **UI**: A Popup (React) that replicates the Chatbot interface.
- **Logic**:
    - Connects to the User's Wallet (MetaMask) via `window.ethereum`.
    - Communicates with the local TEE Backend (`localhost:8000`) to get the Attestation.
    - Sends the transaction to the Flare Blockchain.
- **Security**: The Extension acts as a bridge. It does not hold keys; it delegates signing to MetaMask and logic to the TEE.

This architecture ensures that even if the UI is compromised, the **Smart Contract** will never execute a trade unless the **TEE** (which is isolated) has signed it.
