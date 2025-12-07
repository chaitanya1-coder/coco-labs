// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import {ISparkDEX} from "./interfaces/ISparkDEX.sol";

contract MockDEX is ISparkDEX {
    function swapExactETHForTokens(
        uint amountOutMin,
        address[] calldata path,
        address to,
        uint deadline
    ) external payable override returns (uint[] memory amounts) {
        // Mock swap: return [amountIn, amountOutMin]
        amounts = new uint[](2);
        amounts[0] = msg.value;
        amounts[1] = amountOutMin;
        return amounts;
    }
}
