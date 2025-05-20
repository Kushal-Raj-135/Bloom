// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/**
 * @title Transactions
 * @dev Immutable logger for batch transaction events. Writable only by SupplyChain contract.
 * @notice Uses custom errors for revert reasons.
 */
contract Transactions {
    // --- Custom Errors ---
    error TransactionsUnauthorizedCaller(address caller, address expected);
    error TransactionsIndexOutOfBounds(uint requested, uint max);

    // --- State ---
    address public immutable supplyChainContract; // Authorized writer

    struct TxnLog {
        uint index;
        address actor;
        address involvedParty;
        string eventDescription;
        string latitude;
        string longitude;
        uint timestamp;
        bytes32 dataHash;
        bytes32 previousLogHash;
    }

    TxnLog[] public transactionLog;
    bytes32 public lastLogHash;

    // --- Events ---
    event LogEntryCreated(
        uint indexed index,
        address indexed actor,
        address indexed involvedParty,
        string eventDescription,
        uint timestamp,
        bytes32 currentLogHash
    );

    // --- Constructor ---
    constructor(address _supplyChainContract) {
        // Explicit zero address check for clarity, though SC should guarantee
        if (_supplyChainContract == address(0)) {
            revert("Transactions: SupplyChain address cannot be zero"); // Use string error here as it's constructor
        }
        supplyChainContract = _supplyChainContract;
        lastLogHash = bytes32(0);
    }

    // --- External Functions ---

    /**
     * @dev Logs a new transaction event. Called exclusively by the SupplyChain contract.
     * @notice Ensures caller is the authorized SupplyChain contract.
     */
    function createLogEntry(
        address _actor,
        address _involvedParty,
        string calldata _eventDescription,
        string calldata _latitude,
        string calldata _longitude,
        bytes32 _dataHash
    ) external returns (uint index, bytes32 currentLogHash) {
        // Authorization check
        if (msg.sender != supplyChainContract) {
             revert TransactionsUnauthorizedCaller(msg.sender, supplyChainContract);
        }

        bytes32 previousHash = lastLogHash;
        uint currentIndex = transactionLog.length; // Safe due to 0.8+ checks

        TxnLog memory newLog = TxnLog(
            currentIndex, _actor, _involvedParty, _eventDescription,
            _latitude, _longitude, block.timestamp, _dataHash, previousHash
        );

        transactionLog.push(newLog);

        currentLogHash = keccak256(abi.encode(
            currentIndex, _actor, _involvedParty, _eventDescription,
            _latitude, _longitude, block.timestamp, _dataHash, previousHash
        ));
        lastLogHash = currentLogHash;

        emit LogEntryCreated(currentIndex, _actor, _involvedParty, _eventDescription, block.timestamp, currentLogHash);
        return (currentIndex, currentLogHash);
    }

    // --- View Functions ---

    /**
     * @dev Returns the total number of log entries.
     */
    function getLogCount() external view returns (uint) {
        return transactionLog.length;
    }

    /**
     * @dev Returns a specific log entry by index.
     * @notice Reverts if index is out of bounds.
     */
    function getLogEntry(uint _index) external view returns (TxnLog memory) {
        uint count = transactionLog.length;
        if (_index >= count) {
            revert TransactionsIndexOutOfBounds(_index, count);
        }
        return transactionLog[_index];
    }

    /**
     * @dev Returns all log entries.
     * @notice Be cautious with gas usage for very large logs. Prefer event indexing.
     */
    function getAllLogEntries() external view returns (TxnLog[] memory) {
        return transactionLog;
    }

    /**
     * @dev Returns the hash of the last log entry (or bytes32(0) if none).
     */
    function getLastLogHash() external view returns (bytes32) {
        return lastLogHash;
    }
}