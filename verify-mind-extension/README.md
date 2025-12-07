# Verify-Mind AI Chrome Extension

This extension brings the Verify-Mind AI Chatbot directly to your browser, allowing you to verify TEE-based trading strategies from anywhere.

## Installation Instructions

1.  **Open Chrome Extensions Page**:
    - Open Google Chrome.
    - Navigate to `chrome://extensions` in the address bar.

2.  **Enable Developer Mode**:
    - Toggle the **"Developer mode"** switch in the top-right corner of the page.

3.  **Load Unpacked Extension**:
    - Click the **"Load unpacked"** button that appears in the top-left.
    - Navigate to this project's directory:
      `/Users/chaitanyachawla/Desktop/Verify-Mind/verify-mind-extension`
    - **IMPORTANT**: Select the **`dist`** folder inside it.
      - Path: `.../verify-mind-extension/dist`

4.  **Pin the Extension**:
    - Click the "Puzzle Piece" icon in your Chrome toolbar.
    - Find "Verify-Mind AI Chatbot" and click the "Pin" icon.

## Usage

1.  Click the **Verify-Mind** icon in your toolbar to open the popup.
2.  Click **"Connect"** to link your MetaMask wallet.
3.  Type **"Yes"** to trigger the trading strategy verification flow.
    - The extension will communicate with your local backend (`localhost:8000`) and the Flare Testnet.

## Development

- **Run Dev Server**: `npm run dev` (for hot reloading during dev, though you usually need to rebuild for the extension to update fully).
- **Build**: `npm run build` (Run this after making changes to update the `dist` folder).
