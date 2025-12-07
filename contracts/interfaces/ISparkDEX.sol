// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

interface ISparkDEX {
    /**
     * @notice Swaps tokens on the DEX.
     * @param tokenIn The address of the token to swap from.
     * @param tokenOut The address of the token to swap to.
     * @param amountIn The amount of tokenIn to swap.
     * @param minAmountOut The minimum amount of tokenOut to receive.
     * @return amountOut The actual amount of tokenOut received.
     */
    function swap(
        address tokenIn,
        address tokenOut,
        uint256 amountIn,
        uint256 minAmountOut
    ) external returns (uint256 amountOut);
}
