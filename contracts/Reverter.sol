// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/// @title Reverter
/// @notice Exercises the three revert flavours evmtrace decodes: a string
///         `require`, a custom error, and a `Panic`.
contract Reverter {
    error InsufficientBalance(uint256 available, uint256 required);

    function requireRevert(uint256 x) external pure {
        require(x > 10, "x must exceed 10");
    }

    function customRevert(uint256 available, uint256 required) external pure {
        if (available < required) {
            revert InsufficientBalance(available, required);
        }
    }

    function panic() external pure returns (uint256) {
        uint256 zero = 0;
        // Triggers Panic(0x12): division by zero.
        return 1 / zero;
    }
}
