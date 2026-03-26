// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/// @title Storage
/// @notice Writes to several slots so storage-access tracing has something to show.
contract Storage {
    mapping(bytes32 => bytes32) private store;
    uint256 public writes;

    event Stored(bytes32 indexed key, bytes32 value);

    function set(bytes32 key, bytes32 value) external {
        store[key] = value;
        writes += 1;
        emit Stored(key, value);
    }

    function get(bytes32 key) external view returns (bytes32) {
        return store[key];
    }
}
