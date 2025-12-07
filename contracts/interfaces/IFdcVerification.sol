// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

interface IFdcVerification {
    /**
     * @notice Verifies the attestation proof.
     * @param attestation The attestation data to verify.
     * @return success True if verification succeeded.
     * @return measurement The measurement hash extracted from the attestation.
     */
    function verify(bytes calldata attestation) external returns (bool success, bytes32 measurement);
}
