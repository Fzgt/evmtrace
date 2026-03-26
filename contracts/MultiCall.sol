// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

interface ICounter {
    function increment() external;

    function count() external view returns (uint256);
}

/// @title MultiCall
/// @notice Fans out into repeated child calls so a traced call tree has depth.
contract MultiCall {
    function bump(address counter, uint256 times) external returns (uint256) {
        for (uint256 i = 0; i < times; i++) {
            ICounter(counter).increment();
        }
        return ICounter(counter).count();
    }
}
