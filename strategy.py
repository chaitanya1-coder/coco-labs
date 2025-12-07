import asyncio
from flare_ai_kit import FlareAIKit
from flare_ai_kit.tee.attestation import VtpmAttestation

# Threshold for buying BTC (Example value)
BUY_THRESHOLD = 95000.0

async def run_strategy() -> tuple[str, str | None]:
    """
    Reads BTC price from FTSO. If price < X, return BUY instruction and Attestation Quote.
    """
    # Initialize the Flare AI Kit
    kit = FlareAIKit(None)
    
    # Initialize TEE Attestation (Simulated for local dev)
    # In production, set simulate=False
    attestation = VtpmAttestation(simulate=True)
    
    try:
        # Get the FTSO instance
        ftso = await kit.ftso
        
        # Fetch the latest BTC/USD price
        price = await ftso.get_latest_price("BTC/USD")
        print(f"Current BTC/USD price: {price}")
        
        if price < BUY_THRESHOLD:
            instruction = f"BUY BTC at price {price}"
            print(f"Generating attestation for: {instruction}")
            
            # Generate attestation quote with the instruction as a nonce
            # Nonce must be between 10 and 74 bytes
            quote = attestation.get_token(nonces=[instruction])
            return instruction, quote
        else:
            return "HOLD", None
            
    except Exception as e:
        print(f"Error executing strategy: {e}")
        return "ERROR", None

if __name__ == "__main__":
    instruction, quote = asyncio.run(run_strategy())
    print(f"Instruction: {instruction}")
    if quote:
        print(f"Attestation Quote: {quote}")
