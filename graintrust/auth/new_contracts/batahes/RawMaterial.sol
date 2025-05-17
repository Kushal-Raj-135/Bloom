// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/**
 * @title RawMaterial
 * @dev Represents a batch of raw materials. State managed strictly by SupplyChain.
 * @notice Uses custom errors for revert reasons.
 */
contract RawMaterial {
    // --- Custom Errors ---
    error RM_UnauthorizedCaller(address caller, address expected);
    error RM_InvalidStateForAction(Status current, Status required);
    error RM_InvalidAddress(string context); // e.g., "transporter", "receiver"
    error RM_ReceiverMismatch(address expected, address actual);
    error RM_AlreadyDestroyed();

    // --- Types ---
    enum Status { Created, InTransit, Received, Destroyed }

    // --- State ---
    address public immutable batchId; // Contract's own address serves as unique ID
    address public immutable supplyChainContract; // The only authorized state modifier
    address public immutable transactionLogger; // Dedicated logger instance for this batch

    // Batch Details (Immutable after creation)
    bytes32 public immutable description;
    uint public immutable quantity;
    address public immutable supplier; // The address that created the batch
    address public immutable intendedManufacturer; // The designated recipient
    uint public immutable creationTime; // Timestamp of deployment

    // Dynamic State (Managed by SupplyChain contract calls)
    Status public status;
    address public currentTransporter;
    uint public lastUpdateTime;

    // --- Events ---
    event StatusChanged(Status newStatus, uint timestamp);
    event TransporterAssigned(address indexed transporter, uint timestamp);
    event BatchDestroyed(string reason, uint timestamp);

    // --- Constructor ---
    constructor(
        address _supplyChainContract,
        address _transactionLogger,
        bytes32 _description,
        uint _quantity, // Assume SC validates > 0
        address _supplier,
        address _intendedManufacturer
    ) {
        // Explicit checks for critical immutable addresses
        if (_supplyChainContract == address(0)) revert RM_InvalidAddress("SupplyChainContract");
        if (_transactionLogger == address(0)) revert RM_InvalidAddress("TransactionLogger");
        if (_supplier == address(0)) revert RM_InvalidAddress("Supplier");
        if (_intendedManufacturer == address(0)) revert RM_InvalidAddress("IntendedManufacturer");

        batchId = address(this);
        supplyChainContract = _supplyChainContract;
        transactionLogger = _transactionLogger;
        description = _description;
        quantity = _quantity;
        supplier = _supplier;
        intendedManufacturer = _intendedManufacturer;
        creationTime = block.timestamp;

        status = Status.Created;
        lastUpdateTime = block.timestamp;
        emit StatusChanged(status, lastUpdateTime);
    }

    // --- State Transitions (ONLY callable by SupplyChain contract) ---

    /**
     * @dev Sets status to InTransit. Requires Created state. Only callable by SupplyChain.
     * @notice Checks for zero address transporter.
     */
    function setInTransit(address _transporter) external {
        // Check caller authorization first
        if (msg.sender != supplyChainContract) {
            revert RM_UnauthorizedCaller(msg.sender, supplyChainContract);
        }
        // Check required state
        if (status != Status.Created) {
            revert RM_InvalidStateForAction(status, Status.Created);
        }
        // Check input validity
        if (_transporter == address(0)) {
            revert RM_InvalidAddress("transporter");
        }

        // Effects
        status = Status.InTransit;
        currentTransporter = _transporter;
        lastUpdateTime = block.timestamp;

        // Interactions (Events)
        emit TransporterAssigned(_transporter, lastUpdateTime);
        emit StatusChanged(status, lastUpdateTime);
    }

    /**
     * @dev Sets status to Received. Requires InTransit state and correct receiver. Only callable by SupplyChain.
     */
    function setReceived(address _receiver) external {
        if (msg.sender != supplyChainContract) {
            revert RM_UnauthorizedCaller(msg.sender, supplyChainContract);
        }
        if (status != Status.InTransit) {
            revert RM_InvalidStateForAction(status, Status.InTransit);
        }
        // Although SC should check, double-check receiver validity here
        if (_receiver == address(0)) {
            revert RM_InvalidAddress("receiver");
        }
        if (_receiver != intendedManufacturer) {
            revert RM_ReceiverMismatch(intendedManufacturer, _receiver);
        }

        // Effects
        status = Status.Received;
        currentTransporter = address(0); // Clear transporter on receipt
        lastUpdateTime = block.timestamp;

        // Interactions
        emit StatusChanged(status, lastUpdateTime);
    }

    /**
     * @dev Sets status to Destroyed. Can be called unless already destroyed. Only callable by SupplyChain.
     */
    function setDestroyed(string calldata _reason) external {
        if (msg.sender != supplyChainContract) {
            revert RM_UnauthorizedCaller(msg.sender, supplyChainContract);
        }
        if (status == Status.Destroyed) {
            revert RM_AlreadyDestroyed();
        }

        // Effects
        status = Status.Destroyed;
        currentTransporter = address(0); // Clear transporter
        lastUpdateTime = block.timestamp;

        // Interactions
        emit BatchDestroyed(_reason, lastUpdateTime);
        emit StatusChanged(status, lastUpdateTime);
    }

    // --- View Functions ---

    /**
     * @dev Returns comprehensive batch details.
     */
    function getDetails() external view returns (
        bytes32 _description,
        uint _quantity,
        address _supplier,
        address _intendedManufacturer,
        uint _creationTime,
        Status _status,
        address _currentTransporter,
        uint _lastUpdateTime,
        address _transactionLoggerAddr // Use distinct name from state var
    ) {
        return (
            description,
            quantity,
            supplier,
            intendedManufacturer,
            creationTime,
            status,
            currentTransporter,
            lastUpdateTime,
            transactionLogger // Return the immutable logger address
        );
    }

    /**
     * @dev Returns the current status enum.
     */
    function getStatus() external view returns (Status) {
        return status;
    }
}