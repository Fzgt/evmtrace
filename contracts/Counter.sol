// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/// @title Counter
/// @notice Minimal counter contract used in evmtrace's tracing examples.
contract Counter {
    uint256 public count;

    event Incremented(address indexed by, uint256 newCount);

    function increment() external {
        count += 1;
        emit Incremented(msg.sender, count);
    }

    function incrementBy(uint256 amount) external {
        count += amount;
        emit Incremented(msg.sender, count);
    }

    function reset() external {
        count = 0;
    }
}
