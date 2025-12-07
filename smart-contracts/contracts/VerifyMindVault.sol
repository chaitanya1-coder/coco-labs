// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import {IFdcVerification} from "./interfaces/IFdcVerification.sol";
import {ISparkDEX} from "./interfaces/ISparkDEX.sol";

contract VerifyMindVault {
    // Hardcoded SHA-256 hash of the approved Docker container
    // Hash: sha256:5c8e81f910c11c92e5161cc307365be246f6db5b72a9868fb73516337268e6d1
    bytes32 public constant APPROVED_CODE_HASH = 0x5c8e81f910c11c92e5161cc307365be246f6db5b72a9868fb73516337268e6d1;

    IFdcVerification public fdc;
    ISparkDEX public dex;

    event StrategyExecuted(bytes tradeData, bytes attestation);
    event SwapExecuted(address tokenIn, address tokenOut, uint256 amountIn, uint256 amountOut);
    event FundsReceived(address sender, uint256 amount);

    constructor(address _fdc, address _dex) {
        fdc = IFdcVerification(_fdc);
        dex = ISparkDEX(_dex);
    }

    receive() external payable {
        emit FundsReceived(msg.sender, msg.value);
    }

    /**
     * @notice Executes a strategy if the attestation is valid.
     * @param tradeData The trade instruction data (encoded swap parameters).
     * @param attestation The TEE attestation quote.
     */
    function executeStrategy(bytes memory tradeData, bytes memory attestation) external {
        // Verify the attestation using the FDC contract
        (bool success, bytes32 measurement) = fdc.verify(attestation);
        
        require(success, "Invalid Proof");
        require(measurement == APPROVED_CODE_HASH, "Malicious Code!");

        // Decode trade instructions
        (uint256 amountIn, uint256 amountOutMin, address[] memory path, address to, uint256 deadline) = 
            abi.decode(tradeData, (uint256, uint256, address[], address, uint256));

        // Execute the swap on SparkDEX (or Mock)
        // Sends ETH (C2FLR) and receives tokens at 'to' address
        dex.swapExactETHForTokens{value: amountIn}(amountOutMin, path, to, deadline);

        emit StrategyExecuted(tradeData, attestation);
    }
}
