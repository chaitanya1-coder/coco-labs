from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import asyncio
import sys
import os

# Add flare-ai-kit to python path
# sys.path.append(os.path.abspath("../flare-ai-kit/src"))

from flare_ai_kit import FlareAIKit
from flare_ai_kit.tee.attestation import VtpmAttestation

app = FastAPI(root_path="/api")

# Enable CORS for frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class StrategyResponse(BaseModel):
    message: str
    signature: str
    price: float

@app.post("/execute-strategy")
async def execute_strategy():
    """
    Simulates the TEE strategy execution using real FDC prices.
    """
    print("Executing strategy...")
    
    # Initialize TEE Attestation (Simulated)
    attestation = VtpmAttestation(simulate=True)
    
    # Fetch Real BTC and FLR Prices from FDC
    import httpx
    
    BTC_FEED_ID = "0x014254432f55534400000000000000000000000000" # BTC/USD
    FLR_FEED_ID = "0x01464c522f55534400000000000000000000000000" # FLR/USD
    
    price_btc = 0.0
    price_flr = 0.0
    sparkdex_rate = 0.0
    
    try:
        async with httpx.AsyncClient() as client:
            response = await client.post(
                "https://flr-data-availability.flare.network/api/v0/ftso/anchor-feeds-with-proof",
                json={"feed_ids": [BTC_FEED_ID, FLR_FEED_ID]}
            )
            data = response.json()
            
            # Helper to parse price
            def get_price(feed_id, data):
                for item in data:
                    if item["body"]["id"] == feed_id:
                        return float(item["body"]["value"]) * (10 ** -item["body"]["decimals"])
                return 0.0

            price_btc = get_price(BTC_FEED_ID, data)
            price_flr = get_price(FLR_FEED_ID, data)
            
            print(f"Fetched Prices from FDC - BTC: ${price_btc}, FLR: ${price_flr}")
            
            if price_btc > 0:
                sparkdex_rate = price_flr / price_btc # Implied FLR/BTC rate
            else:
                sparkdex_rate = 0.0000105 # Fallback
            
    except Exception as e:
        print(f"Error fetching FDC prices: {e}")
        price_btc = 94999.00
        sparkdex_rate = 0.0000105
    
    # Use the calculated FDC rate for the trade
    amount_out = 1 * sparkdex_rate
    
    instruction = f"BUY 1 C2FLR worth of WBTC at rate {sparkdex_rate:.8f} (Output: {amount_out:.8f} WBTC)"
    print(f"Generating attestation for: {instruction}")
    
    # Generate attestation quote with the instruction as a nonce
    quote = attestation.get_token(nonces=[instruction])
    
    # The quote serves as the "Proof of Inference" (signature)
    return {
        "message": f"Trigger Detected BUYING 1 C2FLR worth of WBTC (Rate: {sparkdex_rate:.8f} via FDC)",
        "signature": quote,
        "instruction": instruction,
        "price": price_btc
    }

@app.get("/price/{symbol}")
async def get_price(symbol: str):
    """
    Returns the latest price for a given symbol (btc, eth, bnb) from FDC.
    """
    import httpx
    from datetime import datetime
    
    # FDC Feed IDs (Category 01 + Hex(Symbol/USD) + Padding)
    FEED_IDS = {
        "btc": "0x014254432f55534400000000000000000000000000", # BTC/USD
        "eth": "0x014554482f55534400000000000000000000000000", # ETH/USD
        "bnb": "0x01424e422f55534400000000000000000000000000"  # BNB/USD
    }
    
    symbol = symbol.lower()
    if symbol not in FEED_IDS:
        return {"price": 0.0, "error": "Invalid symbol"}
        
    feed_id = FEED_IDS[symbol]
    
    try:
        async with httpx.AsyncClient() as client:
            response = await client.post(
                "https://flr-data-availability.flare.network/api/v0/ftso/anchor-feeds-with-proof",
                json={"feed_ids": [feed_id]}
            )
            data = response.json()
            
            for item in data:
                if item["body"]["id"] == feed_id:
                    price = float(item["body"]["value"]) * (10 ** -item["body"]["decimals"])
                    return {
                        "price": price,
                        "timestamp": datetime.now().strftime("%I:%M %p")
                    }
    except Exception as e:
        print(f"Error fetching {symbol} price: {e}")
        return {"price": 0.0, "error": str(e)}
    
    return {"price": 0.0}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
