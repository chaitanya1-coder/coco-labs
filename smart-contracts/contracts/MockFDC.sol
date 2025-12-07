// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import {IFdcVerification} from "./interfaces/IFdcVerification.sol";

contract MockFDC is IFdcVerification {
    // Matches APPROVED_CODE_HASH in VerifyMindVault
    bytes32 public constant EXPECTED_HASH = 0x5c8e81f910c11c92e5161cc307365be246f6db5b72a9868fb73516337268e6d1;

    function verify(bytes calldata attestation) external pure override returns (bool success, bytes32 measurement) {
        // Always return success and the expected hash for demo purposes
        return (true, EXPECTED_HASH);
    }
}
